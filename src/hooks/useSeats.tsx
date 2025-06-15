import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/hooks/useAuth";

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
  const { user, userProfile } = useAuth();

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
    // Try Supabase session first
    const { data, error } = await supabase.auth.getUser();
    if (!error && data && data.user && data.user.id) {
      return data.user.id;
    }
    // Fallback: Get from Auth context if available
    if (user && user.mobile) {
      // Since we do not have a UUID, return null. Could be patched to use mobile as id in nonsecure flows
      return null;
    }
    return null;
  };

  const lockSeat = async (seatId: string) => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30-minute lock

    const userId = await getUserId();
    if (!userId) {
      // Try to proceed with basic info in very limited fallback use case
      return { error: { message: "Still not authenticated with Supabase; please try logging out and back in." } };
    }

    const { error } = await supabase
      .from('seat_locks')
      .insert({
        seat_id: seatId,
        expires_at: expiresAt.toISOString(),
        user_id: userId
      });

    return { error };
  };

  const releaseSeatLock = async (seatId: string) => {
    const userId = await getUserId();
    if (!userId) {
      return { error: { message: "Still not authenticated with Supabase; please try logging out and back in." } };
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
