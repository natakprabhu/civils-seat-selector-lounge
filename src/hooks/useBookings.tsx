
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Add optional profile and seat fields
export interface BookingRequest {
  id: string;
  user_id: string;
  seat_id: string;
  duration_months: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'cancelled' | 'expired';
  requested_at: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  notes?: string | null;
  profile?: {
    full_name: string;
    email: string;
    mobile: string;
  };
  seat?: {
    id: string;
    seat_number: string;
    section: string;
    row_number: string;
  };
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      // Join profiles and seats tables for richer booking info
      const { data, error } = await supabase
        .from('seat_bookings')
        .select(`
          *,
          profile:profiles!seat_bookings_user_id_fkey(full_name,email,mobile),
          seat:seats(id,seat_number,section,row_number)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;

      const processedBookings: BookingRequest[] = (data || []).map((booking: any) => ({
        id: booking.id,
        user_id: booking.user_id,
        seat_id: booking.seat_id,
        duration_months: booking.duration_months ?? 1,
        total_amount: booking.total_amount ?? 0,
        status: booking.status || "pending",
        requested_at: booking.requested_at,
        approved_at: booking.approved_at,
        approved_by: booking.approved_by,
        notes: booking.notes,
        profile: booking.profile || undefined,
        seat: booking.seat || undefined,
      }));

      setBookings(processedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (seatId: string, durationMonths: number, totalAmount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated. Please log in to book a seat.");
      }
      // Only allow 1 pending/approved seat booking per user
      const { data: existingBooking } = await supabase
        .from('seat_bookings')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved'])
        .maybeSingle();
      if (existingBooking) {
        throw new Error('You already have an active booking request. Please wait for approval or cancel your existing request.');
      }

      // NOTE: show_id is a required field and shouldn't be null. Use a dummy string value for now.
      const showId = 'default-show'; // You could fetch a real show id if necessary.

      const { error } = await supabase
        .from('seat_bookings')
        .insert([{
          user_id: user.id,
          seat_id: seatId,
          duration_months: durationMonths,
          total_amount: totalAmount,
          status: 'pending',
          show_id: showId
        }]);

      if (error) throw new Error(error.message || "Unknown Supabase insert error");
      await fetchBookings();
      return { error: null };
    } catch (error: any) {
      if (typeof error === "string") {
        return { error: { message: error } };
      }
      if (error instanceof Error) {
        return { error: { message: error.message } };
      }
      try {
        if (error && typeof error === "object" && "message" in error && typeof (error as any).message === "string") {
          return { error: { message: (error as any).message } };
        }
        return { error: { message: JSON.stringify(error) || "Unknown error occurred" } };
      } catch {
        return { error: { message: "Unknown error occurred" } };
      }
    }
  };

  const approveBooking = async (bookingId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated. Please log in to approve a booking.");
      }

      const { error } = await supabase
        .from('seat_bookings')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', bookingId);

      if (error) throw error;
      await fetchBookings();
      return { error: null };
    } catch (error: any) {
      const message = error?.message
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error) || "Unknown error while approving booking";
      console.error('Error approving booking:', message);
      return { error: { message } };
    }
  };

  const rejectBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('seat_bookings')
        .update({
          status: 'cancelled'
        })
        .eq('id', bookingId);

      if (error) throw error;
      await fetchBookings();
      return { error: null };
    } catch (error: any) {
      const message = error?.message
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error) || "Unknown error while rejecting booking";
      console.error('Error rejecting booking:', message);
      return { error: { message } };
    }
  };

  useEffect(() => {
    fetchBookings();

    // Set up real-time subscription
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
    approveBooking,
    rejectBooking,
    refetch: fetchBookings
  };
};
