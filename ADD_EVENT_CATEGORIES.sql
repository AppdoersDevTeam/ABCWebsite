-- ABC-FEAT-007
-- Creates event_categories table and seeds default categories.

create extension if not exists "pgcrypto";

create table if not exists public.event_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  sort_order int null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Basic uniqueness to prevent duplicates
create unique index if not exists event_categories_name_key on public.event_categories (lower(name));
create unique index if not exists event_categories_slug_key on public.event_categories (slug);

-- Seed initial set (idempotent)
insert into public.event_categories (name, slug, sort_order, is_active)
values
  ('Sunday Service', 'sunday-service', 10, true),
  ('Members Meeting', 'members-meeting', 20, true),
  ('Fast & Prayer Meeting', 'fast-prayer-meeting', 30, true),
  ('Young Adults', 'young-adults', 40, true),
  ('Kids Programme', 'kids-programme', 50, true),
  ('Community Lunch', 'community-lunch', 60, true),
  ('Other', 'other', 999, true)
on conflict do nothing;

