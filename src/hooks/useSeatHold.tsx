
import { supabase } from "@/integrations/supabase/client";

/**
 * Attempt to "hold" a seat for 10 minutes atomically
 */
export const holdSeat = async ({
  userId,
  showId,
  seatId
}: { userId: string, showId: string, seatId: string }) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  // Quick check: is this seat already held or booked?
  const { data: holds } = await supabase
    .from("seat_holds")
    .select("id, seat_id, expires_at")
    .eq("show_id", showId)
    .eq("seat_id", seatId);

  const now = new Date();
  if (holds && holds.some(h => new Date(h.expires_at) > now)) {
    return { error: { message: "Seat is currently held by another user. Please try another seat." } };
  }
  // Check booked
  const { data: bookings } = await supabase
    .from("seat_bookings")
    .select("id, seat_id")
    .eq("show_id", showId)
    .eq("seat_id", seatId);

  if (bookings && bookings.length) {
    return { error: { message: "Seat is already booked." } };
  }

  // Try to insert hold
  const { error } = await supabase
    .from("seat_holds")
    .insert({
      user_id: userId,
      show_id: showId,
      seat_id: seatId,
      held_at: new Date().toISOString(),
      expires_at: expiresAt,
    });
  return { error: error ? { message: error.message } : null };
};

/**
 * Release a seat hold (e.g., user cancels)
 */
export const releaseSeatHold = async ({
  userId,
  showId,
  seatId
}: { userId: string, showId: string, seatId: string }) => {
  const { error } = await supabase
    .from("seat_holds")
    .delete()
    .eq("user_id", userId)
    .eq("show_id", showId)
    .eq("seat_id", seatId);
  return { error: error ? { message: error.message } : null };
};
