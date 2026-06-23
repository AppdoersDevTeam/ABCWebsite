-- Adds start/end date and time fields to events
-- Run this in Supabase SQL editor for the ABCWebsite project.

alter table public.events
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists start_time text,
  add column if not exists end_time text;

update public.events
set
  start_date = coalesce(start_date, date),
  end_date = coalesce(end_date, date),
  start_time = coalesce(start_time, time),
  end_time = coalesce(end_time, time)
where start_date is null
   or end_date is null
   or start_time is null
   or end_time is null;

alter table public.events
  alter column start_date set not null,
  alter column end_date set not null,
  alter column start_time set not null,
  alter column end_time set not null;
