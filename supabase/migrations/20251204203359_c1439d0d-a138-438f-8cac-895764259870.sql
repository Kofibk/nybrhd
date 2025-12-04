-- Create a secure function to check if the current user is an admin
-- This prevents enumeration of admin emails by returning only a boolean
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_emails
    WHERE email = (auth.jwt() ->> 'email')::text
  )
$$;

-- Drop the existing SELECT policy that allows email enumeration
DROP POLICY IF EXISTS "Users can only check their own admin status" ON public.admin_emails;

-- Create a completely restrictive SELECT policy - no direct table access
CREATE POLICY "No direct select on admin_emails"
ON public.admin_emails
FOR SELECT
TO authenticated
USING (false);