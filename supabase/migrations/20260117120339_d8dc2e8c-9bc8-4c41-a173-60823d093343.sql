-- Add DELETE policy for bookings table so users can cancel their own bookings
CREATE POLICY "Users can delete their own bookings"
ON public.bookings
FOR DELETE
USING (auth.uid() = user_id);

-- Replace handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    -- Sanitize and limit name length to prevent overflow attacks
    substring(COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 1, 255)
  );
  RETURN NEW;
END;
$$;