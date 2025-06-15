
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const fetchSeats = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("seats")
        .select("id, seat_number, section, row_number, monthly_rate");
      setLoading(false);
      if (data && !error) {
        // All fetched seats become "vacant" by default
        // In UI, status will be determined dynamically using existing bookings
        setSeats(
          data.map((row: any) => ({
            id: row.id,
            seat_number: row.seat_number,
            section: row.section,
            row_number: row.row_number,
            status: 'vacant',
            monthly_rate: row.monthly_rate
          }))
        );
      } else {
        setSeats([]);
      }
    };
    fetchSeats();
  }, []);

  return {
    seats,
    loading,
    lockSeat: async () => ({ error: { message: 'Not implemented' } }),
    releaseSeatLock: async () => ({ error: { message: 'Not implemented' } }),
    refetch: () => {}, // Not needed for now
  };
};
