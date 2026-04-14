-- Adds RSVP support fields to events
-- Run this in Supabase SQL editor for the ABCWebsite project.

alter table public.events
add column if not exists rsvp_mode text not null default 'optional';

-- optional | required
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'events_rsvp_mode_check'
  ) then
    alter table public.events
      add constraint events_rsvp_mode_check
      check (rsvp_mode in ('optional', 'required'));
  end if;
end $$;

