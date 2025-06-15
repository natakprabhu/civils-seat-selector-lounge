
-- Flush ALL key library management tables except auth.users.
-- CAREFUL: This will irreversibly delete existing data.

-- Delete bookings and dependencies
DELETE FROM public.seat_bookings;
DELETE FROM public.seat_change_requests;
DELETE FROM public.transactions;
DELETE FROM public.booking_status_history;
DELETE FROM public.seat_locks;
DELETE FROM public.notices;
DELETE FROM public.seat_images;

-- Optionally clear profiles and user_roles (if you want a full flush, uncomment these lines below)
-- DELETE FROM public.user_roles;
-- DELETE FROM public.profiles;

-- Reset all seats to vacant/default rates
UPDATE public.seats SET status = 'vacant', monthly_rate = 2500.00;

-- Optionally, you can add a default admin, profile, or role later via UI or SQL.

-- For any additional new default settings, add them here as needed.
