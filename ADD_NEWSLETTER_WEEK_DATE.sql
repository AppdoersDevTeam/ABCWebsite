-- Add week_date to newsletters (run if table already exists without it)
ALTER TABLE public.newsletters
  ADD COLUMN IF NOT EXISTS week_date DATE;

-- Backfill from month + year (1st of that month), then created_at
UPDATE public.newsletters
SET week_date = to_date(month || ' ' || year::text, 'Month YYYY')
WHERE week_date IS NULL
  AND month IS NOT NULL
  AND year IS NOT NULL;

UPDATE public.newsletters
SET week_date = created_at::date
WHERE week_date IS NULL;

ALTER TABLE public.newsletters
  ALTER COLUMN week_date SET NOT NULL;

CREATE INDEX IF NOT EXISTS newsletters_week_date_idx
  ON public.newsletters (week_date DESC);

COMMENT ON COLUMN public.newsletters.week_date IS
  'Week date for this newsletter edition (used for archive ordering and display)';
