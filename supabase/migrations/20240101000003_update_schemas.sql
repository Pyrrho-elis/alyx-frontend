-- Modify revenue_events table to use username instead of UUID
ALTER TABLE public.revenue_events
ALTER COLUMN creator_id TYPE text;

-- Modify withdrawals table to use username instead of UUID
ALTER TABLE public.withdrawals
ALTER COLUMN creator_id TYPE text;

-- Update the sample data to use your username
UPDATE public.revenue_events
SET creator_id = 'natefxx'  -- Replace with your actual username
WHERE creator_id = '00000000-0000-0000-0000-000000000000';

UPDATE public.withdrawals
SET creator_id = 'natefxx'  -- Replace with your actual username
WHERE creator_id = '00000000-0000-0000-0000-000000000000';
