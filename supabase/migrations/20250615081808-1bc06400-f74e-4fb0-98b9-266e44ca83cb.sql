
-- Enable RLS on seat_locks table (if not already enabled)
ALTER TABLE public.seat_locks ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own seat locks" ON public.seat_locks;
DROP POLICY IF EXISTS "Users can create their own seat locks" ON public.seat_locks;
DROP POLICY IF EXISTS "Users can update their own seat locks" ON public.seat_locks;
DROP POLICY IF EXISTS "Users can delete their own seat locks" ON public.seat_locks;

-- Allow users to SELECT only seat locks belonging to themselves
CREATE POLICY "Users can view their own seat locks"
  ON public.seat_locks FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to INSERT seat locks, only for their own user_id
CREATE POLICY "Users can create their own seat locks"
  ON public.seat_locks FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to UPDATE seat locks, only for their own user_id
CREATE POLICY "Users can update their own seat locks"
  ON public.seat_locks FOR UPDATE
  USING (user_id = auth.uid());

-- Allow users to DELETE seat locks, only for their own user_id
CREATE POLICY "Users can delete their own seat locks"
  ON public.seat_locks FOR DELETE
  USING (user_id = auth.uid());
