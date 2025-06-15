
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SeatMapState =
  | "available"
  | "held"
  | "booked";

export interface SeatStatus {
  seat_id: string;
  state: SeatMapState;
  hold_user_id?: string | null;
  booking_user_id?: string | null;
  hold_expires_at?: string | null;
  booked_at?: string | null;
}

export const useSeatMapStatus = (showId: string) => {
  const [seatStatuses, setSeatStatuses] = useState<Record<string, SeatStatus>>({});
  const [loading, setLoading] = useState(true);

  const fetchSeatStates = async () => {
    setLoading(true);

    // Get all seats
    const { data: allSeatsRaw } = await supabase
      .from("seats")
      .select("id, seat_number, row_number, section");

    // Get live seat_holds (not expired)
    const { data: seatHolds } = await supabase
      .from("seat_holds")
      .select("seat_id, user_id, expires_at")
      .eq("show_id", showId);

    // Get all seat_bookings for this show
    const { data: seatBookings } = await supabase
      .from("seat_bookings")
      .select("seat_id, user_id, booked_at")
      .eq("show_id", showId);

    // Build map
    const now = new Date();
    const holdMap = new Map<string, { user_id: string; expires_at: string }>();
    (seatHolds || []).forEach(h => {
      if (h.expires_at && new Date(h.expires_at) > now) {
        holdMap.set(h.seat_id, { user_id: h.user_id, expires_at: h.expires_at });
      }
    });

    const bookingMap = new Map<string, { user_id: string; booked_at: string }>();
    (seatBookings || []).forEach(b => {
      bookingMap.set(b.seat_id, { user_id: b.user_id, booked_at: b.booked_at });
    });

    // State per seat
    const seatsStatus: Record<string, SeatStatus> = {};
    (allSeatsRaw || []).forEach(seat => {
      if (bookingMap.has(seat.id)) {
        seatsStatus[seat.id] = {
          seat_id: seat.id,
          state: "booked",
          booking_user_id: bookingMap.get(seat.id)!.user_id,
          booked_at: bookingMap.get(seat.id)!.booked_at,
        };
      } else if (holdMap.has(seat.id)) {
        seatsStatus[seat.id] = {
          seat_id: seat.id,
          state: "held",
          hold_user_id: holdMap.get(seat.id)!.user_id,
          hold_expires_at: holdMap.get(seat.id)!.expires_at,
        };
      } else {
        seatsStatus[seat.id] = {
          seat_id: seat.id,
          state: "available",
        };
      }
    });

    setSeatStatuses(seatsStatus);
    setLoading(false);
  };

  useEffect(() => {
    fetchSeatStates();

    // Real-time updates
    const channel = supabase
      .channel('seat-live')
      .on('postgres_changes', { schema: 'public', table: 'seat_holds', event: '*' }, fetchSeatStates)
      .on('postgres_changes', { schema: 'public', table: 'seat_bookings', event: '*' }, fetchSeatStates)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [showId]);

  return { seatStatuses, loading, refetch: fetchSeatStates };
};
