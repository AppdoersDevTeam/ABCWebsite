-- Migrate Roster to PDF-based System
-- This script safely migrates from the old roster table to the new roster_images table with PDF support

-- Step 1: Drop old roster table if it exists (only if you want to completely replace it)
-- Uncomment the next line if you want to drop the old roster table:
-- DROP TABLE IF EXISTS roster CASCADE;

-- Step 2: Create roster_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS roster_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date) -- Only one roster PDF per date
);

-- Step 3: If table exists with old schema (image_url), migrate it
DO $$
BEGIN
  -- Check if pdf_url column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roster_images' 
    AND column_name = 'pdf_url'
  ) THEN
    -- If image_url exists, rename it to pdf_url
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'roster_images' 
      AND column_name = 'image_url'
    ) THEN
      ALTER TABLE roster_images RENAME COLUMN image_url TO pdf_url;
    ELSE
      -- If neither exists, add pdf_url
      ALTER TABLE roster_images ADD COLUMN pdf_url TEXT;
      -- Make it NOT NULL after adding (if you want)
      -- ALTER TABLE roster_images ALTER COLUMN pdf_url SET NOT NULL;
    END IF;
  END IF;
END $$;

-- Step 4: Ensure date column exists and has UNIQUE constraint
DO $$
BEGIN
  -- Add date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roster_images' 
    AND column_name = 'date'
  ) THEN
    ALTER TABLE roster_images ADD COLUMN date DATE;
  END IF;
  
  -- Add UNIQUE constraint on date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'roster_images_date_key'
  ) THEN
    ALTER TABLE roster_images ADD CONSTRAINT roster_images_date_key UNIQUE (date);
  END IF;
END $$;

-- Step 5: Enable RLS
ALTER TABLE roster_images ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Authenticated users can read roster PDFs" ON roster_images;
DROP POLICY IF EXISTS "Authenticated users can read roster images" ON roster_images;
DROP POLICY IF EXISTS "Admins can manage roster PDFs" ON roster_images;
DROP POLICY IF EXISTS "Admins can manage roster images" ON roster_images;

-- Step 7: Create RLS policies
CREATE POLICY "Authenticated users can read roster PDFs" ON roster_images
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage roster PDFs" ON roster_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );

-- Step 8: Create or replace trigger function
CREATE OR REPLACE FUNCTION update_roster_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Drop and recreate trigger
DROP TRIGGER IF EXISTS update_roster_images_updated_at ON roster_images;
CREATE TRIGGER update_roster_images_updated_at
  BEFORE UPDATE ON roster_images
  FOR EACH ROW
  EXECUTE FUNCTION update_roster_images_updated_at();

-- Step 10: Create index on date if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_roster_images_date ON roster_images(date DESC);


