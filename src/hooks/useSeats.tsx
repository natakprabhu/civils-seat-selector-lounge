
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
          fetchSeats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // lockSeat also takes current user
  const lockSeat = async (seatId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1-hour lock

    // Clean expired locks before locking new
    await supabase.rpc('cleanup_expired_locks');

    const { error } = await supabase
      .from('seat_locks')
      .insert({
        seat_id: seatId,
        user_id: user.id,
        expires_at: expiresAt.toISOString()
      });

    // Update the seat to on_hold after locking
    if (!error) {
      await supabase
        .from('seats')
        .update({ status: 'on_hold' })
        .eq('id', seatId);
    }
    return { error };
  };

  // If user cancels or admin rejects, unlock the seat
  const releaseSeatLock = async (seatId: string) => {
    const { error } = await supabase
      .from('seat_locks')
      .delete()
      .eq('seat_id', seatId);

    // Update the seat back to vacant
    if (!error) {
      await supabase
        .from('seats')
        .update({ status: 'vacant' })
        .eq('id', seatId);
    }
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
