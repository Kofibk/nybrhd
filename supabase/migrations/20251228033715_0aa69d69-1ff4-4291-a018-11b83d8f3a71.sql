-- Fix buyer_contacts RLS: Replace overly permissive SELECT policy with owner-scoped access

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Users can view buyer contacts" ON public.buyer_contacts;

-- Create policy for users to view only their own contacts
CREATE POLICY "Users can view their own buyer contacts"
ON public.buyer_contacts FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for admins to view all contacts (needed for admin dashboard)
CREATE POLICY "Admins can view all buyer contacts"
ON public.buyer_contacts FOR SELECT
USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));