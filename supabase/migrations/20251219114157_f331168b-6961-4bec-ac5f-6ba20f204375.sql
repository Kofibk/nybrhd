-- Create table to track Airtable ↔ Supabase sync mappings
CREATE TABLE public.airtable_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  airtable_table TEXT NOT NULL,
  airtable_record_id TEXT NOT NULL,
  supabase_table TEXT NOT NULL,
  supabase_record_id UUID NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(airtable_record_id),
  UNIQUE(supabase_table, supabase_record_id)
);

-- Enable RLS
ALTER TABLE public.airtable_sync ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage sync records
CREATE POLICY "Admins can manage airtable_sync" 
ON public.airtable_sync 
FOR ALL 
USING (is_current_user_admin() OR is_admin(auth.uid()));

-- Create index for fast lookups
CREATE INDEX idx_airtable_sync_airtable ON public.airtable_sync(airtable_table, airtable_record_id);
CREATE INDEX idx_airtable_sync_supabase ON public.airtable_sync(supabase_table, supabase_record_id);