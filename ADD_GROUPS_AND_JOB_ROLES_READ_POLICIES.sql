-- Allow authenticated users to read groups + job roles.
-- Required for dashboard roster + leader display (joins read from groups/job_roles).
-- Run in Supabase SQL Editor.

alter table public.groups enable row level security;
drop policy if exists "Authenticated users can read groups" on public.groups;
create policy "Authenticated users can read groups" on public.groups
  for select
  to authenticated
  using (auth.role() = 'authenticated');

alter table public.job_roles enable row level security;
drop policy if exists "Authenticated users can read job roles" on public.job_roles;
create policy "Authenticated users can read job roles" on public.job_roles
  for select
  to authenticated
  using (auth.role() = 'authenticated');

