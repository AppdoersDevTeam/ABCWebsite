-- Adds event image support (banner/thumbnail)
-- Run this in Supabase SQL editor for the ABCWebsite project.

alter table public.events
add column if not exists image_url text;

