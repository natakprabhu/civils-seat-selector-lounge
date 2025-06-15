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
      // As the seats table does not contain a 'status' column, add default status 'vacant'
      const seatsWithStatus: Seat[] = (data || []).map((seat: any) => ({
        ...seat,
        status: (seat.status as Seat["status"]) || 'vacant', // fallback
      }));

      setSeats(seatsWithStatus);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();

    const channel = supabase
      .channel('seats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seats'
        },
        () => {
          fetchSeats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // lockSeat and releaseSeatLock moved out (as seat_locks table does not exist in supabase types)
  // You may re-add lock logic in the future after creating the necessary table and fields.

  return {
    seats,
    loading,
    refetch: fetchSeats
  };
};
