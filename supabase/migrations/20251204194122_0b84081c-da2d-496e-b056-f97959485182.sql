-- Add restrictive RLS policies for INSERT, UPDATE, DELETE on admin_emails
-- These operations should not be allowed through the application layer
-- Admin emails should only be managed through direct database access

-- Deny all INSERT operations (admin emails managed via migrations only)
CREATE POLICY "No public insert on admin_emails"
ON public.admin_emails
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Deny all UPDATE operations
CREATE POLICY "No public update on admin_emails"
ON public.admin_emails
FOR UPDATE
TO authenticated
USING (false);

-- Deny all DELETE operations
CREATE POLICY "No public delete on admin_emails"
ON public.admin_emails
FOR DELETE
TO authenticated
USING (false);