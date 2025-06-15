import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Seat {
  id: string;
  seat_number: string;
  section: string;
  row_number: string;
  monthly_rate: number;
}

export const useSeats = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeats = async () => {
    try {
      const { data, error } = await supabase
        .from("seats")
        .select("*")
        .order("seat_number");
      if (error) throw error;
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

  return {
    seats,
    loading,
    refetch: fetchSeats
  };
};
