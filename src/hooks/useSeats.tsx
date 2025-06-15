
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface Seat {
  id: string;
  seat_number: string;
  section: string;
  row_number: string;
  status: 'vacant' | 'booked' | 'pending';
  monthly_rate: number; // Add to match backend schema
}

const SEAT_AVAILABILITY_API = `https://llvujxdmzuyebkzuutqn.functions.supabase.co/seat_availability`;

export const useSeats = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeats = async () => {
    try {
      const resp = await fetch(SEAT_AVAILABILITY_API);
      const map = await resp.json();
      // Assign a default monthly_rate if missing
      const seatsWithStatus: Seat[] = Object.values(map).map((seat: any) => ({
        ...seat,
        // fallback in case monthly_rate missing from map
        monthly_rate: seat.monthly_rate !== undefined ? seat.monthly_rate : 2500
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

  return {
    seats,
    loading,
    refetch: fetchSeats
  };
};
