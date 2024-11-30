-- Create function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return (
    select exists (
      select 1
      from auth.users
      where id = auth.uid()
      and raw_user_meta_data->>'is_admin' = 'true'
    )
  );
end;
$$ language plpgsql security definer;

-- Enable RLS on withdrawals table if not already enabled
alter table "public"."withdrawals" enable row level security;

-- Policy for admins to view all withdrawals
create policy "admins_can_view_all_withdrawals"
on "public"."withdrawals"
for select
to authenticated
using (
  public.is_admin()
);

-- Policy for users to view their own withdrawals
create policy "users_can_view_own_withdrawals"
on "public"."withdrawals"
for select
to authenticated
using (creator_id = auth.uid());
