
-- Retain only users with admin role, delete all others from your profiles and user_roles.
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT user_id FROM public.user_roles
  WHERE role != 'admin'
);

DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM public.profiles
  WHERE id NOT IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

-- Optional: Delete seat bookings, change requests, locks, transactions, etc. (flush actual business data)
DELETE FROM public.seat_bookings;
DELETE FROM public.seat_change_requests;
DELETE FROM public.seat_locks;
DELETE FROM public.transactions;
DELETE FROM public.booking_status_history;
DELETE FROM public.notices;
DELETE FROM public.seat_images;

-- Reset all seats to vacant/default rates
UPDATE public.seats SET status = 'vacant', monthly_rate = 2500.00;

-- Optionally: Reset settings, etc, if desired.
-- DELETE FROM public.library_settings;
