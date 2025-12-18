
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'member', 'viewer');

-- Create enum for client types
CREATE TYPE public.client_type AS ENUM ('developer', 'agent', 'broker');

-- Create enum for subscription plans
CREATE TYPE public.subscription_plan AS ENUM ('starter', 'growth', 'enterprise', 'custom');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trial', 'paused');

-- Create enum for invoice status
CREATE TYPE public.invoice_status AS ENUM ('draft', 'pending', 'paid', 'failed', 'refunded', 'cancelled');

-- Create enum for invitation status
CREATE TYPE public.invitation_status AS ENUM ('pending', 'sent', 'opened', 'accepted', 'expired', 'cancelled');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Add new columns to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_contact_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS monthly_budget NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS total_spend NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_leads INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS onboarded_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Client invitations table
CREATE TABLE public.client_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT NOT NULL,
  client_type client_type NOT NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  invitation_token TEXT UNIQUE,
  monthly_budget NUMERIC(12,2),
  notes TEXT,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_company_id UUID REFERENCES public.companies(id),
  created_user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'starter',
  status subscription_status NOT NULL DEFAULT 'trial',
  monthly_fee NUMERIC(10,2),
  setup_fee NUMERIC(10,2),
  leads_included INTEGER DEFAULT 0,
  leads_used INTEGER DEFAULT 0,
  overage_rate NUMERIC(10,2),
  billing_cycle TEXT DEFAULT 'monthly',
  billing_cycle_start DATE,
  billing_cycle_end DATE,
  trial_ends_at DATE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status invoice_status NOT NULL DEFAULT 'pending',
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at DATE,
  payment_method TEXT,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice line items table
CREATE TABLE public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  type TEXT DEFAULT 'subscription',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Create has_role function for checking user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin (has admin or super_admin role)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
  )
  OR public.is_current_user_admin()
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_current_user_admin() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

-- RLS Policies for client_invitations
CREATE POLICY "Admins can view all invitations"
  ON public.client_invitations FOR SELECT
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can create invitations"
  ON public.client_invitations FOR INSERT
  WITH CHECK (public.is_current_user_admin() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can update invitations"
  ON public.client_invitations FOR UPDATE
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete invitations"
  ON public.client_invitations FOR DELETE
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

-- RLS Policies for subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can view own company subscription"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.company_id = subscriptions.company_id
    )
  );

CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

-- RLS Policies for invoices
CREATE POLICY "Admins can view all invoices"
  ON public.invoices FOR SELECT
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can view own company invoices"
  ON public.invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.company_id = invoices.company_id
    )
  );

CREATE POLICY "Admins can manage invoices"
  ON public.invoices FOR ALL
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

-- RLS Policies for invoice_line_items
CREATE POLICY "Admins can view all line items"
  ON public.invoice_line_items FOR SELECT
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can view own invoice line items"
  ON public.invoice_line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      JOIN public.profiles ON profiles.company_id = invoices.company_id
      WHERE invoices.id = invoice_line_items.invoice_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage line items"
  ON public.invoice_line_items FOR ALL
  USING (public.is_current_user_admin() OR public.is_admin(auth.uid()));

-- Add updated_at trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add user_type column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'individual';
