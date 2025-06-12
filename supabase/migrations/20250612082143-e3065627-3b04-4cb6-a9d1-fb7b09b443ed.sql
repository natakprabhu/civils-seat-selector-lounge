
-- Reset all seat statuses to vacant
UPDATE public.seats SET status = 'vacant';

-- Clear all seat bookings
DELETE FROM public.seat_bookings;

-- Clear all transactions
DELETE FROM public.transactions;

-- Clear all seat change requests
DELETE FROM public.seat_change_requests;

-- Clear all seat locks
DELETE FROM public.seat_locks;

-- Reset seat monthly rates to default if needed
UPDATE public.seats SET monthly_rate = 2500.00 WHERE monthly_rate IS NULL;
