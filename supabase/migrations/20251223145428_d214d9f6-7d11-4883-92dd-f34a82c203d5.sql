-- Add new columns to profiles table for comprehensive onboarding data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS company_linkedin TEXT,
ADD COLUMN IF NOT EXISTS company_instagram TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS regions_covered TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS upsell_interest BOOLEAN DEFAULT FALSE;

-- Create team_invitations table for storing invited team members during onboarding
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own invitations (as inviter)
CREATE POLICY "Users can view their sent invitations"
ON public.team_invitations
FOR SELECT
USING (auth.uid() = inviter_id);

-- Policy: Users can create invitations
CREATE POLICY "Users can create team invitations"
ON public.team_invitations
FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

-- Policy: Users can update their own invitations
CREATE POLICY "Users can update their own invitations"
ON public.team_invitations
FOR UPDATE
USING (auth.uid() = inviter_id);

-- Policy: Users can delete their own invitations
CREATE POLICY "Users can delete their own invitations"
ON public.team_invitations
FOR DELETE
USING (auth.uid() = inviter_id);

-- Policy: Admins can manage all team invitations
CREATE POLICY "Admins can manage all team invitations"
ON public.team_invitations
FOR ALL
USING (is_current_user_admin() OR is_admin(auth.uid()));