-- Drop the restrictive policy and create a permissive one for company creation
DROP POLICY IF EXISTS "Users can create their own company" ON public.companies;

-- Create a permissive INSERT policy for authenticated users
CREATE POLICY "Authenticated users can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also allow admins to create companies (already covered by their ALL policy, but being explicit)
DROP POLICY IF EXISTS "Admins can create companies" ON public.companies;
CREATE POLICY "Admins can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (is_current_user_admin() OR is_admin(auth.uid()));