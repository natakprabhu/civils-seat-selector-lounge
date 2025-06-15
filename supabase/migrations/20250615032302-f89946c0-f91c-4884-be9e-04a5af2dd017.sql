
-- Enable RLS on seat_bookings table if not already enabled
ALTER TABLE public.seat_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own bookings and admins can view all" ON public.seat_bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.seat_bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.seat_bookings;

-- Create RLS policies for seat_bookings
CREATE POLICY "Users can view their own bookings and admins can view all" 
ON public.seat_bookings FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
);

CREATE POLICY "Users can create their own bookings" 
ON public.seat_bookings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update bookings" 
ON public.seat_bookings FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

-- Enable RLS on seat_images table if not already enabled
ALTER TABLE public.seat_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all seat images" ON public.seat_images;
DROP POLICY IF EXISTS "Admins can upload seat images" ON public.seat_images;
DROP POLICY IF EXISTS "Admins can update seat images" ON public.seat_images;
DROP POLICY IF EXISTS "Admins can delete seat images" ON public.seat_images;

-- Create RLS policies for seat_images (admin only)
CREATE POLICY "Admins can view all seat images" 
ON public.seat_images FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admins can upload seat images" 
ON public.seat_images FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admins can update seat images" 
ON public.seat_images FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admins can delete seat images" 
ON public.seat_images FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

-- Enable RLS on notices table if not already enabled
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view active notices" ON public.notices;
DROP POLICY IF EXISTS "Admins can create notices" ON public.notices;
DROP POLICY IF EXISTS "Admins can update notices" ON public.notices;
DROP POLICY IF EXISTS "Admins can delete notices" ON public.notices;

-- Create RLS policies for notices
CREATE POLICY "Everyone can view active notices" 
ON public.notices FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can create notices" 
ON public.notices FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admins can update notices" 
ON public.notices FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admins can delete notices" 
ON public.notices FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

-- Make sure user_id column in seat_bookings is NOT NULL to prevent RLS violations
ALTER TABLE public.seat_bookings ALTER COLUMN user_id SET NOT NULL;
