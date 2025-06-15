import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    // 1. Clean up expired locks: cancel all pending bookings whose lock expired
    // Get all pending bookings
    const { data: pendingBookings } = await supabase
      .from("seat_bookings")
      .select("id, seat_id, status")
      .eq("status", "pending");

    if (pendingBookings && pendingBookings.length > 0) {
      for (const booking of pendingBookings) {
        // Get lock for this booking
        const { data: lock } = await supabase
          .from("seat_locks")
          .select("expires_at")
          .eq("seat_id", booking.seat_id)
          .maybeSingle();

        const lockExpired = !lock || (lock.expires_at && new Date(lock.expires_at) < new Date());
        // If lock expired, cancel booking
        if (lockExpired) {
          await supabase
            .from("seat_bookings")
            .update({ status: "cancelled" })
            .eq("id", booking.id)
            .eq("status", "pending");
        }
      }
    }

    // 2. Generate seat status map
    // Get all seats
    const { data: seats, error: seatErr } = await supabase
      .from("seats")
      .select("id, seat_number, section, row_number");

    if (seatErr) throw seatErr;

    // Get all bookings (pending and approved)
    const { data: bookings } = await supabase
      .from("seat_bookings")
      .select("id, seat_id, status")
      .in("status", ["pending", "approved"]);

    // Get all seat_locks (for current time)
    const { data: locks } = await supabase
      .from("seat_locks")
      .select("seat_id, expires_at");

    const now = new Date();

    const seatsMap = {};

    for (const seat of seats) {
      // Is there an approved booking for this seat?
      const booked = bookings?.find(
        b => b.seat_id === seat.id && b.status === "approved"
      );
      if (booked) {
        seatsMap[seat.seat_number] = { ...seat, status: "booked" };
        continue;
      }

      // Is there a pending booking with a valid lock?
      const pending = bookings?.find(
        b => b.seat_id === seat.id && b.status === "pending"
      );
      if (pending) {
        // Is lock active?
        const lock = locks?.find(l => l.seat_id === seat.id);
        const lockActive =
          lock && lock.expires_at && new Date(lock.expires_at) > now;
        if (lockActive) {
          seatsMap[seat.seat_number] = { ...seat, status: "pending" };
          continue;
        }
      }
      // Otherwise available
      seatsMap[seat.seat_number] = { ...seat, status: "vacant" };
    }

    return new Response(JSON.stringify(seatsMap), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
