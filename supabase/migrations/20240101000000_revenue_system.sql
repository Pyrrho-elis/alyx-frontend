-- Create revenue_events table
create table if not exists public.revenue_events (
    id uuid default gen_random_uuid() primary key,
    creator_id text references auth.users(id),
    event_type text not null check (event_type in ('subscription', 'renewal', 'refund')),
    amount decimal not null,
    platform_fee decimal not null,
    creator_share decimal not null,
    status text not null default 'available' check (status in ('available', 'withdrawn', 'refunded')),
    withdrawal_id uuid references public.withdrawals(id),
    processed_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create withdrawals table
create table if not exists public.withdrawals (
    id uuid default gen_random_uuid() primary key,
    creator_id text references auth.users(id),
    amount decimal not null,
    status text not null default 'pending' check (status in ('pending', 'completed', 'rejected')),
    processed_at timestamp with time zone,
    completed_at timestamp with time zone,
    withdrawal_id uuid default gen_random_uuid(),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.revenue_events enable row level security;
alter table public.withdrawals enable row level security;

-- Creators can only view their own revenue events
create policy "Creators can view own revenue events"
    on public.revenue_events for select
    using (auth.uid() = creator_id);

-- Creators can only view their own withdrawals
create policy "Creators can view own withdrawals"
    on public.withdrawals for select
    using (auth.uid() = creator_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger handle_revenue_events_updated_at
    before update on public.revenue_events
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_withdrawals_updated_at
    before update on public.withdrawals
    for each row
    execute procedure public.handle_updated_at();
