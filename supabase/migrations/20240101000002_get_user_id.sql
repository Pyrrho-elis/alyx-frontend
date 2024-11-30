-- Get your user ID
select id, email
from auth.users
where email = 'your-email@example.com';  -- Replace with your actual email

-- After you get your ID, update the sample data by replacing all instances of
-- '00000000-0000-0000-0000-000000000000' with your actual user ID using:
update public.revenue_events
set creator_id = 'YOUR-ACTUAL-USER-ID'  -- Replace with your ID
where creator_id = '00000000-0000-0000-0000-000000000000';

update public.withdrawals
set creator_id = 'YOUR-ACTUAL-USER-ID'  -- Replace with your ID
where creator_id = '00000000-0000-0000-0000-000000000000';
