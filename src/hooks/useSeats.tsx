import { useState, useEffect } from 'react';

export interface Seat {
  id: string;
  seat_number: string;
  section: string;
  row_number: string;
  status: 'vacant' | 'booked' | 'pending';
}

const SEAT_AVAILABILITY_API = `https://llvujxdmzuyebkzuutqn.functions.supabase.co/seat_availability`;

export const useSeats = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeats = async () => {
    try {
      const resp = await fetch(SEAT_AVAILABILITY_API);
      const map = await resp.json();
      const seatsWithStatus: Seat[] = Object.values(map);
      setSeats(seatsWithStatus);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    // Optionally, subscribe for live updates using Supabase if needed.
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

  return {
    seats,
    loading,
    refetch: fetchSeats
  };
};
