
import { supabase } from "@/integrations/supabase/client";

/**
 * Confirm booking after payment (atomic)
 */
export const confirmBooking = async ({
  userId,
  showId,
  seatId,
  payment_reference,
}: { userId: string, showId: string, seatId: string, payment_reference: string }) => {
  // First, verify there's a hold for this seat by this user
  const { data: hold } = await supabase
    .from("seat_holds")
    .select("id")
    .eq("show_id", showId)
    .eq("seat_id", seatId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!hold) return { error: { message: "No active hold for this seat." } };

  // Insert booking and delete hold (simulate atomic via sequence, but in proper production use a rpc)
  const { error: bookingErr } = await supabase
    .from("seat_bookings")
    .insert({
      user_id: userId,
      show_id: showId,
      seat_id: seatId,
      payment_reference,
      booked_at: new Date().toISOString(),
    });

  if (bookingErr) return { error: { message: bookingErr.message } };

  await supabase
    .from("seat_holds")
    .delete()
    .eq("id", hold.id);

  return { error: null };
};
