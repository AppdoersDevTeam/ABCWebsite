-- Allow authenticated users to read their own ministry memberships.
-- Required for roster_images RLS policy that checks group membership.
-- Run in Supabase SQL Editor.

alter table public.team_member_groups enable row level security;

drop policy if exists "Users can read own team member groups" on public.team_member_groups;
create policy "Users can read own team member groups" on public.team_member_groups
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.team_members tm
      where tm.id = team_member_groups.team_member_id
        and tm.user_id = auth.uid()
    )
  );

