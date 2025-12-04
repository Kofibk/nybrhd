-- Create admin_emails table for whitelist
CREATE TABLE public.admin_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check if email is admin (for auth check)
CREATE POLICY "Anyone can check admin emails"
ON public.admin_emails
FOR SELECT
USING (true);

-- Insert default admin email (you can add more later)
INSERT INTO public.admin_emails (email) VALUES ('admin@naybourhood.ai');