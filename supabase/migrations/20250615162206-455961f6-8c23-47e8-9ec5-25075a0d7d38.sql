
-- Remove the current SELECT policy (which restricts to user_id)
DROP POLICY IF EXISTS "Users can view their own bookings and admins can view all" ON public.seat_bookings;

-- Add a new SELECT policy: any authenticated user can view all bookings (for seat map accuracy)
CREATE POLICY "All authenticated users can view all bookings" 
  ON public.seat_bookings FOR SELECT 
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
