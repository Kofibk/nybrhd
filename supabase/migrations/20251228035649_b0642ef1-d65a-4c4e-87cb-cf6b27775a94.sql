-- Drop the conflicting RESTRICTIVE policy for authenticated users
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

-- Recreate as PERMISSIVE policy so authenticated users can create companies during onboarding
CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
TO authenticated 
WITH CHECK (true);