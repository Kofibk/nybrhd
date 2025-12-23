-- Drop the restrictive admin-only insert policy that's conflicting
DROP POLICY IF EXISTS "Admins can insert companies" ON public.companies;