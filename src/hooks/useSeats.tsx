
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

  const lockSeat = async (seatId: string) => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30-minute lock

    const { error } = await supabase
      .from('seat_locks')
      .insert({
        seat_id: seatId,
        expires_at: expiresAt.toISOString()
      });

    return { error };
  };

  const releaseSeatLock = async (seatId: string) => {
    const { error } = await supabase
      .from('seat_locks')
      .delete()
      .eq('seat_id', seatId);

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
