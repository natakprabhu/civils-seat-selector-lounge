
-- Drop the existing strict insert policy, if present
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.seat_bookings;

-- Drop the previous test policy (if created with wrong clause)
DROP POLICY IF EXISTS "Test: Any authenticated user can insert bookings" ON public.seat_bookings;

-- Add a permissive test policy: allow any authenticated user to insert bookings (correct clause)
CREATE POLICY "Test: Any authenticated user can insert bookings"
  ON public.seat_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
