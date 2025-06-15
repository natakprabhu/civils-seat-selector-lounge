
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BookingRequest {
  id: string;
  user_id: string;
  seat_id: string;
  show_id: string;
  booked_at: string;
  payment_reference: string | null;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('seat_bookings')
        .select('*')
        .order('booked_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (seatId: string, showId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated. Please log in to book a seat.");
      }

      // Only allow 1 active seat booking per user
      const { data: existingBooking } = await supabase
        .from('seat_bookings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (existingBooking) {
        throw new Error('You already have an active booking request.');
      }

      const { error } = await supabase
        .from('seat_bookings')
        .insert({
          seat_id: seatId,
          show_id: showId,
          user_id: user.id,
        });

      if (error) throw new Error(error.message || "Unknown Supabase insert error");
      await fetchBookings();
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  useEffect(() => {
    fetchBookings();

    // Real-time subscription
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seat_bookings'
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    bookings,
    loading,
    createBooking,
    refetch: fetchBookings
  };
};
