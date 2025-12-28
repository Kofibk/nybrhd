-- Create a helper function to check if user has billing admin role
CREATE OR REPLACE FUNCTION public.is_billing_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('billing_admin', 'admin', 'super_admin')
  )
  OR public.is_current_user_admin()
$$;

-- Drop existing user SELECT policies for invoices (keep admin policies)
DROP POLICY IF EXISTS "Users can view own company invoices" ON public.invoices;

-- Create new policy: Only billing admins can view company invoices
CREATE POLICY "Billing admins can view company invoices" 
ON public.invoices 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.company_id = invoices.company_id
  )
  AND public.is_billing_admin(auth.uid())
);

-- Drop existing user SELECT policies for subscriptions (keep admin policies)
DROP POLICY IF EXISTS "Users can view own company subscription" ON public.subscriptions;

-- Create new policy: Only billing admins can view company subscriptions
CREATE POLICY "Billing admins can view company subscription" 
ON public.subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.company_id = subscriptions.company_id
  )
  AND public.is_billing_admin(auth.uid())
);

-- Drop existing user SELECT policies for invoice_line_items (keep admin policies)
DROP POLICY IF EXISTS "Users can view own invoice line items" ON public.invoice_line_items;

-- Create new policy: Only billing admins can view invoice line items
CREATE POLICY "Billing admins can view invoice line items" 
ON public.invoice_line_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM invoices
    JOIN profiles ON profiles.company_id = invoices.company_id
    WHERE invoices.id = invoice_line_items.invoice_id 
    AND profiles.user_id = auth.uid()
  )
  AND public.is_billing_admin(auth.uid())
);