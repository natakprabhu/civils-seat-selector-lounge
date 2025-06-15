
-- Remove NOT NULL constraint from show_id if desired, or drop column entirely
ALTER TABLE public.seat_bookings DROP COLUMN show_id;
