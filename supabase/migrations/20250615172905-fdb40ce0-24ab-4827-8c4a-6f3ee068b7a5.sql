
-- 1. Create the temporary holds table (seat_holds)
CREATE TABLE IF NOT EXISTS public.seat_holds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL, -- link to a show/event/timeslot if needed
  seat_id UUID NOT NULL,
  user_id UUID NOT NULL,
  held_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE (show_id, seat_id) -- Only one hold per seat per show
);

-- 2. Redefine the seat_bookings table as per your new requirements
DROP TABLE IF EXISTS public.seat_bookings CASCADE;

CREATE TABLE public.seat_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL,
  seat_id UUID NOT NULL,
  user_id UUID NOT NULL,
  booked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_reference TEXT -- To be filled after payment
);

-- 3. (Optionally) Remove old seat locking/booked fields in seats table
ALTER TABLE public.seats
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS updated_at;

-- 4. (Optionally) Remove obsolete tables, e.g., seat_locks, booking_status_history, etc.
DROP TABLE IF EXISTS public.seat_locks CASCADE;
DROP TABLE IF EXISTS public.booking_status_history CASCADE;

-- 5. Add indices for fast lookups
CREATE INDEX IF NOT EXISTS idx_seat_holds_expires_at ON public.seat_holds(expires_at);
CREATE INDEX IF NOT EXISTS idx_seat_holds_show_seat ON public.seat_holds(show_id, seat_id);

CREATE INDEX IF NOT EXISTS idx_seat_bookings_show_seat ON public.seat_bookings(show_id, seat_id);
CREATE INDEX IF NOT EXISTS idx_seat_bookings_user_id ON public.seat_bookings(user_id);

-- 6. [Optional] Enable Row Level Security and suitable RLS policies as needed

