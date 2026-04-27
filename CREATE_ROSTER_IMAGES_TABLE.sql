-- Create Roster PDFs Table
-- This table stores roster PDFs uploaded for ministries (groups) and date ranges.
-- Safe to re-run (idempotent).

-- Drop existing roster table if it exists and has the old schema
-- (We're replacing it with a simpler PDF-based approach)
DROP TABLE IF EXISTS roster CASCADE;

-- Create base table (if missing)
CREATE TABLE IF NOT EXISTS roster_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Legacy single-date roster support (deprecated). Prefer date_from/date_to.
  date DATE,
  -- Ministry / group association
  group_id UUID,
  -- Date range this roster covers
  date_from DATE,
  date_to DATE,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure required columns exist / types are correct (existing tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'roster_images' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE roster_images ADD COLUMN group_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'roster_images' AND column_name = 'date_from'
  ) THEN
    ALTER TABLE roster_images ADD COLUMN date_from DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'roster_images' AND column_name = 'date_to'
  ) THEN
    ALTER TABLE roster_images ADD COLUMN date_to DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'roster_images' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE roster_images ADD COLUMN pdf_url TEXT;
  END IF;

  -- Backfill date_from/date_to from legacy date where present
  UPDATE roster_images
  SET date_from = COALESCE(date_from, date),
      date_to = COALESCE(date_to, date)
  WHERE (date_from IS NULL OR date_to IS NULL) AND date IS NOT NULL;
END $$;

-- Ensure FK exists (groups must already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'roster_images_group_id_fkey'
  ) THEN
    ALTER TABLE roster_images
      ADD CONSTRAINT roster_images_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop old unique(date) constraint if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.roster_images'::regclass
      AND contype = 'u'
      AND conname = 'roster_images_date_key'
  ) THEN
    ALTER TABLE roster_images DROP CONSTRAINT roster_images_date_key;
  END IF;
END $$;

-- Add uniqueness for ministry+range
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.roster_images'::regclass
      AND contype = 'u'
      AND conname = 'roster_images_group_date_range_key'
  ) THEN
    ALTER TABLE roster_images
      ADD CONSTRAINT roster_images_group_date_range_key UNIQUE (group_id, date_from, date_to);
  END IF;
END $$;

-- Enforce NOT NULL (if existing legacy rows are present, fix them before enabling)
-- ALTER TABLE roster_images ALTER COLUMN group_id SET NOT NULL;
-- ALTER TABLE roster_images ALTER COLUMN date_from SET NOT NULL;
-- ALTER TABLE roster_images ALTER COLUMN date_to SET NOT NULL;
-- ALTER TABLE roster_images ALTER COLUMN pdf_url SET NOT NULL;

-- Enable RLS
ALTER TABLE roster_images ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read roster PDFs
DROP POLICY IF EXISTS "Authenticated users can read roster PDFs" ON roster_images;
CREATE POLICY "Authenticated users can read roster PDFs" ON roster_images
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert/update/delete
DROP POLICY IF EXISTS "Admins can manage roster PDFs" ON roster_images;
CREATE POLICY "Admins can manage roster PDFs" ON roster_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_roster_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_roster_images_updated_at ON roster_images;
CREATE TRIGGER update_roster_images_updated_at
  BEFORE UPDATE ON roster_images
  FOR EACH ROW
  EXECUTE FUNCTION update_roster_images_updated_at();

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_roster_images_group_date_from ON roster_images(group_id, date_from DESC);
CREATE INDEX IF NOT EXISTS idx_roster_images_date_from ON roster_images(date_from DESC);

