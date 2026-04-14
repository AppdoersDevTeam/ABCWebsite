-- Adds audience targeting to events
-- Run this in Supabase SQL editor for the ABCWebsite project.

alter table public.events
add column if not exists audience text not null default 'members';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'events_audience_check'
  ) then
    alter table public.events
      add constraint events_audience_check
      check (audience in ('all', 'staff', 'members', 'attendees'));
  end if;
end $$;

