
-- First, let's create a function to help debug auth context
CREATE OR REPLACE FUNCTION public.fetch_uid()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Drop the temporary permissive test policy
DROP POLICY IF EXISTS "Test: Any authenticated user can insert bookings" ON public.seat_bookings;

-- Create a more robust insert policy for seat_bookings
CREATE POLICY "Users can create their own bookings"
  ON public.seat_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also ensure we have a proper select policy for viewing bookings
DROP POLICY IF EXISTS "All authenticated users can view all bookings" ON public.seat_bookings;

CREATE POLICY "Users can view their own bookings and admins can view all"
  ON public.seat_bookings 
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
  );
