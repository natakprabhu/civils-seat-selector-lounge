
-- Ensure function exists. It already does, but let's be safe.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, mobile)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'mobile', new.phone, '')
  );

  -- Assign default client role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'client');
  
  RETURN new;
END;
$function$;

-- Ensure TRIGGER is attached to auth.users (replace if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
