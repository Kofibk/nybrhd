-- Add permissive SELECT policy for authenticated users on buyers table
CREATE POLICY "Authenticated users can view buyers"
ON public.buyers
FOR SELECT
TO authenticated
USING (true);

-- Drop the existing restrictive policy on campaign_data and recreate as permissive
DROP POLICY IF EXISTS "Authenticated users can view campaign_data" ON public.campaign_data;

CREATE POLICY "Authenticated users can view campaign_data"
ON public.campaign_data
FOR SELECT
TO authenticated
USING (true);