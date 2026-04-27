-- Adds Groups + Job Roles for Directory / People
-- Run this in Supabase SQL editor for the ABCWebsite project.

-- 1) Groups (generic tags)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  sort_order int null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null
);

create unique index if not exists groups_slug_unique on public.groups (slug);
create unique index if not exists groups_name_unique on public.groups (name);

-- RLS (admin-only management)
alter table public.groups enable row level security;
drop policy if exists "Admins can manage groups" on public.groups;
create policy "Admins can manage groups" on public.groups
  for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- 2) Job Roles (job titles; can be multiple per person)
create table if not exists public.job_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  sort_order int null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null
);

create unique index if not exists job_roles_slug_unique on public.job_roles (slug);
create unique index if not exists job_roles_name_unique on public.job_roles (name);

alter table public.job_roles enable row level security;
drop policy if exists "Admins can manage job roles" on public.job_roles;
create policy "Admins can manage job roles" on public.job_roles
  for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- 3) Join tables
create table if not exists public.team_member_groups (
  team_member_id uuid not null references public.team_members(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete restrict,
  created_at timestamp with time zone not null default now(),
  primary key (team_member_id, group_id)
);

create table if not exists public.team_member_job_roles (
  team_member_id uuid not null references public.team_members(id) on delete cascade,
  job_role_id uuid not null references public.job_roles(id) on delete restrict,
  created_at timestamp with time zone not null default now(),
  primary key (team_member_id, job_role_id)
);

alter table public.team_member_groups enable row level security;
drop policy if exists "Admins can manage team member groups" on public.team_member_groups;
create policy "Admins can manage team member groups" on public.team_member_groups
  for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

alter table public.team_member_job_roles enable row level security;
drop policy if exists "Admins can manage team member job roles" on public.team_member_job_roles;
create policy "Admins can manage team member job roles" on public.team_member_job_roles
  for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- Optional: seed a few common groups (safe to remove)
insert into public.groups (name, slug, sort_order)
values
  ('Worship', 'worship', 1),
  ('Women', 'women', 2),
  ('Sound', 'sound', 3),
  ('Data', 'data', 4),
  ('Children''s Ministry', 'childrens-ministry', 5)
on conflict (slug) do nothing;

-- Optional: seed common job role titles (matches current directory dropdown)
insert into public.job_roles (name, slug, sort_order)
values
  ('Administrator', 'administrator', 1),
  ('Associated Pastor', 'associated-pastor', 2),
  ('Children Pastor', 'children-pastor', 3),
  ('Deacon', 'deacon', 4),
  ('Elder', 'elder', 5),
  ('Ministry Leader', 'ministry-leader', 6),
  ('Receptionist', 'receptionist', 7),
  ('Senior Pastor', 'senior-pastor', 8),
  ('Youth Adult Pastor', 'youth-adult-pastor', 9),
  ('Youth Pastor', 'youth-pastor', 10)
on conflict (slug) do nothing;
