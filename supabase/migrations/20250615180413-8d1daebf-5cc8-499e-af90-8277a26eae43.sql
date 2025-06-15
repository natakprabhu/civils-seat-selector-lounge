
ALTER TABLE public.seat_bookings
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS duration_months integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS requested_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS notes text;
