-- Allow authenticated users to insert their own company during onboarding
CREATE POLICY "Users can create their own company" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own company (via profile link)
CREATE POLICY "Users can view their own company" 
ON public.companies 
FOR SELECT 
USING (
  id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Allow users to update their own company
CREATE POLICY "Users can update their own company" 
ON public.companies 
FOR UPDATE 
USING (
  id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid())
);