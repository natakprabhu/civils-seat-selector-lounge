
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Seat {
  id: string;
  seat_number: string;
  section: string;
  row_number: string;
  status: 'vacant' | 'booked' | 'maintenance' | 'on_hold';
  monthly_rate: number;
}

export const useSeats = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeats = async () => {
    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .order('seat_number');

      if (error) throw error;
      
      console.log('Fetched seats:', data);
      setSeats(data || []);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();

    // Set up real-time subscription
    const channel = supabase
      .channel('seats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seats'
        },
        (payload) => {
          console.log('Seat change detected:', payload);
          fetchSeats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper to get current user id and ensure it's defined
  const getUserId = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      console.error('No supabase user found', error);
      return null;
    }
    if (!data.user.id) {
      console.error("User has no id (possible signup before profile trigger runs)");
      return null;
    }
    return data.user.id;
  };

  const lockSeat = async (seatId: string) => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30-minute lock

    const userId = await getUserId();
    if (!userId) {
      console.error("User not authenticated or user id not ready during lockSeat");
      return { error: { message: "User not authenticated, or profile not created yet. Try refreshing or re-logging in." } };
    }

    const { error } = await supabase
      .from('seat_locks')
      .insert({
        seat_id: seatId,
        expires_at: expiresAt.toISOString(),
        user_id: userId
      });

    if (error && error.message.includes("violates foreign key constraint")) {
      console.error("Foreign key error: profile not created yet for user, try waiting a few seconds after signup.", error);
      return { error: { message: "Your profile is being set up. Please wait a few seconds and try again, or refresh and re-login." } };
    }

    return { error };
  };

  const releaseSeatLock = async (seatId: string) => {
    const userId = await getUserId();
    if (!userId) {
      return { error: { message: "User not authenticated." } };
    }

    const { error } = await supabase
      .from('seat_locks')
      .delete()
      .eq('seat_id', seatId)
      .eq('user_id', userId);

    return { error };
  };

  return {
    seats,
    loading,
    lockSeat,
    releaseSeatLock,
    refetch: fetchSeats
  };
};
