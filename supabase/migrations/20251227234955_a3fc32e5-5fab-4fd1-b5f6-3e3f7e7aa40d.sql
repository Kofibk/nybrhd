-- Create buyers table for real buyer data
CREATE TABLE public.buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  budget_min NUMERIC(12,2),
  budget_max NUMERIC(12,2),
  location_preferences TEXT[],
  property_types TEXT[],
  timeline TEXT,
  bedrooms INTEGER,
  purpose TEXT CHECK (purpose IN ('investment', 'primary_residence', 'holiday_home')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'mortgage', 'undecided')),
  quality_score INTEGER DEFAULT 50,
  intent_score INTEGER DEFAULT 50,
  source TEXT,
  source_campaign_id UUID,
  verified BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view buyers based on their subscription tier
CREATE POLICY "Users can view buyers based on subscription"
ON public.buyers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.subscriptions s ON s.company_id = p.company_id
    WHERE p.user_id = auth.uid()
    AND (
      (s.plan = 'enterprise') OR
      (s.plan = 'growth' AND buyers.quality_score >= 50) OR
      (s.plan = 'starter' AND buyers.quality_score BETWEEN 50 AND 69)
    )
  )
);

-- Allow admins full access to buyers
CREATE POLICY "Admins can manage buyers"
ON public.buyers FOR ALL
USING (is_current_user_admin() OR is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_buyers_updated_at
  BEFORE UPDATE ON public.buyers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add profile update policy (users can update their own profile)
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add profile insert policy for new users
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);