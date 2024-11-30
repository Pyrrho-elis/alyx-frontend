-- Insert sample withdrawals
insert into public.withdrawals (id, creator_id, amount, status, created_at, completed_at)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 500.00, 'completed', now() - interval '5 days', now() - interval '5 days'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 300.00, 'pending', now() - interval '1 day', null);

-- Insert sample revenue events
insert into public.revenue_events (
    creator_id,
    subscriber_id,
    tier_id,
    amount,
    platform_fee,
    creator_share,
    event_type,
    status,
    created_at,
    processed_at,
    withdrawal_id
)
values
    -- Successful subscriptions (available)
    ('00000000-0000-0000-0000-000000000000', 'sub1', 'tier1', 100.00, 25.00, 75.00, 'subscription', 'available', now() - interval '30 days', null, null),
    ('00000000-0000-0000-0000-000000000000', 'sub2', 'tier2', 200.00, 50.00, 150.00, 'subscription', 'available', now() - interval '25 days', null, null),
    ('00000000-0000-0000-0000-000000000000', 'sub3', 'tier2', 150.00, 37.50, 112.50, 'subscription', 'available', now() - interval '20 days', null, null),
    
    -- Recent subscriptions (last 7 days)
    ('00000000-0000-0000-0000-000000000000', 'sub4', 'tier1', 100.00, 25.00, 75.00, 'subscription', 'available', now() - interval '6 days', null, null),
    ('00000000-0000-0000-0000-000000000000', 'sub5', 'tier2', 200.00, 50.00, 150.00, 'subscription', 'available', now() - interval '5 days', null, null),
    ('00000000-0000-0000-0000-000000000000', 'sub6', 'tier2', 150.00, 37.50, 112.50, 'subscription', 'available', now() - interval '3 days', null, null),
    ('00000000-0000-0000-0000-000000000000', 'sub7', 'tier1', 100.00, 25.00, 75.00, 'subscription', 'available', now() - interval '1 day', null, null),
    
    -- Withdrawn events
    ('00000000-0000-0000-0000-000000000000', 'sub8', 'tier2', 300.00, 75.00, 225.00, 'subscription', 'withdrawn', now() - interval '10 days', now() - interval '5 days', '11111111-1111-1111-1111-111111111111'),
    ('00000000-0000-0000-0000-000000000000', 'sub9', 'tier2', 400.00, 100.00, 300.00, 'subscription', 'withdrawn', now() - interval '8 days', now() - interval '5 days', '11111111-1111-1111-1111-111111111111'),
    
    -- Pending withdrawal
    ('00000000-0000-0000-0000-000000000000', 'sub10', 'tier1', 200.00, 50.00, 150.00, 'subscription', 'withdrawn', now() - interval '2 days', null, '22222222-2222-2222-2222-222222222222'),
    ('00000000-0000-0000-0000-000000000000', 'sub11', 'tier2', 200.00, 50.00, 150.00, 'subscription', 'withdrawn', now() - interval '2 days', null, '22222222-2222-2222-2222-222222222222'),
    
    -- Refunds
    ('00000000-0000-0000-0000-000000000000', 'sub12', 'tier1', 100.00, 25.00, 75.00, 'refund', 'refunded', now() - interval '15 days', now() - interval '15 days', null),
    
    -- Renewals
    ('00000000-0000-0000-0000-000000000000', 'sub1', 'tier1', 100.00, 25.00, 75.00, 'renewal', 'available', now() - interval '10 days', null, null),
    ('00000000-0000-0000-0000-000000000000', 'sub2', 'tier2', 200.00, 50.00, 150.00, 'renewal', 'available', now() - interval '5 days', null, null);

-- Note: Replace '00000000-0000-0000-0000-000000000000' with your actual user ID
-- You can get your user ID by running: select id from auth.users where email = 'your-email@example.com';
