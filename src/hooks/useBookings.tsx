
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BookingRequest {
  id: string;
  user_id: string;
  seat_id: string;
  duration_months: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'cancelled' | 'expired';
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  notes?: string;
  seat?: {
    seat_number: string;
    section: string;
  };
  profile?: {
    full_name: string;
    email: string;
    mobile: string;
  };
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('seat_bookings')
        .select(`
          *,
          seat:seats(seat_number, section),
          profile:profiles!seat_bookings_user_id_fkey(full_name, email, mobile)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      
      // Type-safe data processing
      const processedBookings: BookingRequest[] = (data || []).map(booking => ({
        id: booking.id,
        user_id: booking.user_id,
        seat_id: booking.seat_id,
        duration_months: booking.duration_months,
        total_amount: booking.total_amount,
        status: booking.status,
        requested_at: booking.requested_at,
        approved_at: booking.approved_at,
        approved_by: booking.approved_by,
        notes: booking.notes,
        seat: booking.seat ? {
          seat_number: booking.seat.seat_number,
          section: booking.seat.section
        } : undefined,
        profile: booking.profile ? {
          full_name: booking.profile.full_name,
          email: booking.profile.email,
          mobile: booking.profile.mobile
        } : undefined
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

      // Check if user already has an active booking
      const { data: existingBooking } = await supabase
        .from('seat_bookings')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved'])
        .single();

      if (existingBooking) {
        throw new Error('You already have an active booking request. Please wait for approval or cancel your existing request.');
      }

      // Create new booking
      const { error } = await supabase
        .from('seat_bookings')
        .insert({
          seat_id: seatId,
          duration_months: durationMonths,
          total_amount: totalAmount,
          user_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      // Update seat status to on_hold
      await supabase
        .from('seats')
        .update({ status: 'on_hold' })
        .eq('id', seatId);

      await fetchBookings();
      return { error: null };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
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

      // Update seat status to booked
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await supabase
          .from('seats')
          .update({ status: 'booked' })
          .eq('id', booking.seat_id);
      }

      await fetchBookings();
      return { error: null };
    } catch (error) {
      console.error('Error approving booking:', error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
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

      // Update seat status back to vacant
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await supabase
          .from('seats')
          .update({ status: 'vacant' })
          .eq('id', booking.seat_id);
      }

      await fetchBookings();
      return { error: null };
    } catch (error) {
      console.error('Error rejecting booking:', error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
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
