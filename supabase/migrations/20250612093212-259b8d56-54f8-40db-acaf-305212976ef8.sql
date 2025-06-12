
-- Add notices table for admin-managed notices
CREATE TABLE IF NOT EXISTS public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  type text DEFAULT 'general' CHECK (type IN ('general', 'urgent', 'maintenance', 'event')),
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  is_active boolean DEFAULT true
);

-- Add seat images table
CREATE TABLE IF NOT EXISTS public.seat_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id uuid REFERENCES public.seats(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  uploaded_by uuid REFERENCES public.profiles(id),
  UNIQUE(seat_id)
);

-- Add booking status tracking table
CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.seat_bookings(id) ON DELETE CASCADE,
  old_status text,
  new_status text,
  changed_at timestamp with time zone DEFAULT now(),
  changed_by uuid REFERENCES public.profiles(id),
  notes text
);

-- Create storage bucket for seat images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('seat-images', 'seat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- Notices policies (readable by all, writable by admin/staff)
CREATE POLICY "Everyone can view active notices" ON public.notices
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin and staff can manage notices" ON public.notices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Seat images policies
CREATE POLICY "Everyone can view seat images" ON public.seat_images
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage seat images" ON public.seat_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Booking history policies
CREATE POLICY "Users can view their booking history" ON public.booking_status_history
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM public.seat_bookings 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin and staff can view all booking history" ON public.booking_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Storage policies for seat images
CREATE POLICY "Anyone can view seat images" ON storage.objects
  FOR SELECT USING (bucket_id = 'seat-images');

CREATE POLICY "Admin can upload seat images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'seat-images' AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Add constraint to prevent multiple active bookings per user
ALTER TABLE public.seat_bookings 
ADD CONSTRAINT unique_active_booking_per_user 
UNIQUE (user_id) 
DEFERRABLE INITIALLY DEFERRED;

-- Clear dummy data
DELETE FROM public.transactions WHERE description LIKE '%demo%' OR description LIKE '%test%';
DELETE FROM public.seat_bookings WHERE notes LIKE '%demo%' OR notes LIKE '%test%';

-- Update seat status enum to include 'on_hold'
ALTER TYPE seat_status ADD VALUE IF NOT EXISTS 'on_hold';
