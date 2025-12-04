-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can check admin emails" ON public.admin_emails;

-- Create a new restrictive policy that only allows authenticated users to check their own email
CREATE POLICY "Users can only check their own admin status"
ON public.admin_emails
FOR SELECT
TO authenticated
USING (email = (auth.jwt() ->> 'email')::text);