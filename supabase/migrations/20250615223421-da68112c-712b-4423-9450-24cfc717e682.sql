
-- Create seat_holds table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.seat_holds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seat_id UUID NOT NULL REFERENCES public.seats(id),
  user_id UUID NOT NULL,
  held_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lock_expiry TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 minutes')
);

-- Add Row Level Security to seat_holds
ALTER TABLE public.seat_holds ENABLE ROW LEVEL SECURITY;

-- Create policies for seat_holds
CREATE POLICY "Users can view all seat holds" 
  ON public.seat_holds 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own seat holds" 
  ON public.seat_holds 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seat holds" 
  ON public.seat_holds 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add subscription_end_date to seat_bookings table
ALTER TABLE public.seat_bookings 
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Create function to cleanup expired holds and cancel expired bookings
CREATE OR REPLACE FUNCTION public.cleanup_expired_holds_and_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cancel expired pending bookings that have expired holds
  UPDATE public.seat_bookings 
  SET status = 'cancelled'
  WHERE status = 'pending' 
  AND id IN (
    SELECT sb.id 
    FROM public.seat_bookings sb
    JOIN public.seat_holds sh ON sb.seat_id = sh.seat_id AND sb.user_id = sh.user_id
    WHERE sh.lock_expiry < now()
  );
  
  -- Remove expired holds
  DELETE FROM public.seat_holds 
  WHERE lock_expiry < now();
END;
$$;
