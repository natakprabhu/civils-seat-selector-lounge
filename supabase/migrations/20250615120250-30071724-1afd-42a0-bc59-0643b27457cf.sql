
-- Create a table to track pending OTP verifications for user emails
CREATE TABLE public.pending_otps (
  email TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '10 minutes')
);

-- Enable Row Level Security
ALTER TABLE public.pending_otps ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert an OTP
CREATE POLICY "Allow insert OTP" ON public.pending_otps
FOR INSERT WITH CHECK (true);

-- Allow anyone to select any OTP (by email)
CREATE POLICY "Allow select OTP by email" ON public.pending_otps
FOR SELECT USING (true);

-- Allow anyone to delete OTP (will be used after successful verification)
CREATE POLICY "Allow delete OTP by email" ON public.pending_otps
FOR DELETE USING (true);
