-- Enable RLS
alter table public.users enable row level security;

-- Add admin column if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'users' 
    and column_name = 'is_admin') then
    
    alter table public.users 
    add column is_admin boolean default false;
  end if;
end $$;

-- Add tracking columns
alter table public.users 
add column if not exists created_by uuid references auth.users(id),
add column if not exists updated_by uuid references auth.users(id),
add column if not exists updated_at timestamp with time zone;

-- Create policies
create policy "Public users are viewable by everyone"
  on public.users for select
  using (true);

create policy "Users can only be created by admins"
  on public.users for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and is_admin = true
    )
  );

create policy "Users can only be updated by admins"
  on public.users for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and is_admin = true
    )
  );

-- Create your first admin user (replace with your user's ID)
-- Run this manually in SQL editor after creating your first user:
/*
update public.users
set is_admin = true
where id = 'your-user-id-here';
*/

-- Create function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists(
    select 1 from public.users
    where id = auth.uid()
    and is_admin = true
  );
end;
$$ language plpgsql security definer;
