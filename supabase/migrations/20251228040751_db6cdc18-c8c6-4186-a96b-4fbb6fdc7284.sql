-- Drop existing buyer_contacts table and its policies (will be replaced with new schema)
DROP POLICY IF EXISTS "Admins can view all buyer contacts" ON public.buyer_contacts;
DROP POLICY IF EXISTS "Users can create buyer contacts" ON public.buyer_contacts;
DROP POLICY IF EXISTS "Users can view their own buyer contacts" ON public.buyer_contacts;
DROP TABLE IF EXISTS public.buyer_contacts;

-- Create buyer assignments table
-- Links Airtable buyers to Supabase users
CREATE TABLE public.buyer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airtable_record_id TEXT NOT NULL,
  airtable_lead_id INTEGER,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'contacted', 'in_progress', 'converted', 'expired', 'released')),
  notes TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(airtable_record_id, user_id)
);

-- Create buyer contacts table (new schema)
CREATE TABLE public.buyer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.buyer_assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  airtable_record_id TEXT NOT NULL,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('email', 'whatsapp', 'phone', 'in_person')),
  message_content TEXT,
  contacted_at TIMESTAMPTZ DEFAULT NOW(),
  response_received BOOLEAN DEFAULT FALSE,
  response_at TIMESTAMPTZ,
  outcome TEXT CHECK (outcome IN ('no_response', 'interested', 'not_interested', 'viewing_booked', 'converted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_buyer_assignments_user ON public.buyer_assignments(user_id);
CREATE INDEX idx_buyer_assignments_airtable ON public.buyer_assignments(airtable_record_id);
CREATE INDEX idx_buyer_assignments_status ON public.buyer_assignments(status);
CREATE INDEX idx_buyer_contacts_user ON public.buyer_contacts(user_id);
CREATE INDEX idx_buyer_contacts_assignment ON public.buyer_contacts(assignment_id);

-- Enable RLS
ALTER TABLE public.buyer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_contacts ENABLE ROW LEVEL SECURITY;

-- RLS for buyer_assignments
CREATE POLICY "Users can view own assignments" ON public.buyer_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all assignments" ON public.buyer_assignments
  FOR ALL USING (
    public.is_current_user_admin() OR public.is_admin(auth.uid())
  );

-- RLS for buyer_contacts
CREATE POLICY "Users can record contacts" ON public.buyer_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own contacts" ON public.buyer_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contacts" ON public.buyer_contacts
  FOR SELECT USING (
    public.is_current_user_admin() OR public.is_admin(auth.uid())
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_buyer_assignment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER buyer_assignments_updated
  BEFORE UPDATE ON public.buyer_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_buyer_assignment_timestamp();