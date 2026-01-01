-- Drop overly strict check constraints to allow Airtable data
ALTER TABLE public.buyers DROP CONSTRAINT IF EXISTS buyers_payment_method_check;
ALTER TABLE public.buyers DROP CONSTRAINT IF EXISTS buyers_purpose_check;