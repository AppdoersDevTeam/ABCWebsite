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

-- Optional: seed a few common groups (safe to remove)
insert into public.groups (name, slug, sort_order)
values
  ('Worship', 'worship', 1),
  ('Women', 'women', 2),
  ('Sound', 'sound', 3),
  ('Data', 'data', 4),
  ('Children''s Ministry', 'childrens-ministry', 5)
on conflict (slug) do nothing;

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

-- Optional: seed a few common groups (safe to remove)
insert into public.groups (name, slug, sort_order)
values
  ('Worship', 'worship', 1),
  ('Women', 'women', 2),
  ('Sound', 'sound', 3),
  ('Data', 'data', 4),
  ('Children''s Ministry', 'childrens-ministry', 5)
on conflict (slug) do nothing;

