
-- Allow phone-auth users without email to sign up by making email nullable in profiles.
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
