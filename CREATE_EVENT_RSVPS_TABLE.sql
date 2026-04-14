-- Creates event_rsvps table for event RSVP capture
-- Run this in Supabase SQL editor for the ABCWebsite project.

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists event_rsvps_event_email_unique
  on public.event_rsvps(event_id, lower(email));

