-- Fix seat_holds table to match types
ALTER TABLE public.seat_holds 
  ADD COLUMN IF NOT EXISTS show_id UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Copy lock_expiry data to expires_at if lock_expiry exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'seat_holds' AND column_name = 'lock_expiry'
  ) THEN
    UPDATE public.seat_holds SET expires_at = lock_expiry WHERE expires_at IS NULL;
    ALTER TABLE public.seat_holds DROP COLUMN lock_expiry;
  END IF;
END $$;

-- Make expires_at NOT NULL with default
ALTER TABLE public.seat_holds 
  ALTER COLUMN expires_at SET NOT NULL,
  ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '30 minutes');