-- Add Teens & Youth event category (idempotent)
insert into public.event_categories (name, slug, sort_order, is_active)
values ('Teens & Youth', 'teens-youth', 45, true)
on conflict do nothing;
