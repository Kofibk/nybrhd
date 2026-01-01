-- Create campaign_data table for Previous Campaign Data from Airtable
CREATE TABLE IF NOT EXISTS public.campaign_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  airtable_record_id TEXT UNIQUE,
  
  -- Campaign identification
  campaign_id TEXT,
  campaign_name TEXT,
  ad_set_id TEXT,
  ad_set_name TEXT,
  ad_id TEXT,
  ad_name TEXT,
  
  -- Performance metrics
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  link_clicks INTEGER DEFAULT 0,
  lpv INTEGER DEFAULT 0,
  video_plays INTEGER DEFAULT 0,
  page_likes INTEGER DEFAULT 0,
  post_engagement INTEGER DEFAULT 0,
  
  -- Cost metrics
  total_spent NUMERIC(10, 2) DEFAULT 0,
  cpc NUMERIC(10, 4),
  cpm NUMERIC(10, 4),
  ctr NUMERIC(10, 6),
  cost_per_lpv NUMERIC(10, 4),
  frequency NUMERIC(10, 4),
  
  -- Content
  platform TEXT,
  format TEXT,
  delivery_status TEXT,
  headline TEXT,
  primary_text TEXT,
  destination_url TEXT,
  thumbnail_url TEXT,
  
  -- Dates
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to buyers table for full Airtable compatibility
ALTER TABLE public.buyers 
ADD COLUMN IF NOT EXISTS airtable_record_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS lead_id INTEGER,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS budget_range TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Contact Pending',
ADD COLUMN IF NOT EXISTS intent TEXT,
ADD COLUMN IF NOT EXISTS assigned_caller TEXT,
ADD COLUMN IF NOT EXISTS development_name TEXT,
ADD COLUMN IF NOT EXISTS date_added TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Enable RLS on campaign_data
ALTER TABLE public.campaign_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for campaign_data
CREATE POLICY "Admins can manage campaign_data" 
ON public.campaign_data 
FOR ALL 
USING (is_current_user_admin() OR is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view campaign_data" 
ON public.campaign_data 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create updated_at trigger for campaign_data
CREATE TRIGGER update_campaign_data_updated_at
BEFORE UPDATE ON public.campaign_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaign_data_campaign_name ON public.campaign_data(campaign_name);
CREATE INDEX IF NOT EXISTS idx_campaign_data_date ON public.campaign_data(date);
CREATE INDEX IF NOT EXISTS idx_buyers_airtable_record_id ON public.buyers(airtable_record_id);