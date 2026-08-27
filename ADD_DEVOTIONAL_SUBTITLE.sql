-- Add subtitle to devotionals (run if table already exists without subtitle)
ALTER TABLE public.devotionals
  ADD COLUMN IF NOT EXISTS subtitle TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.devotionals.subtitle IS
  'Topic or secondary heading for the weekly devotional (e.g. The Trellis and the Vine)';
