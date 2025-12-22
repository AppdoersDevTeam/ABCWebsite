-- Create Roster PDFs Table
-- This table stores roster PDFs uploaded for specific dates

-- Drop existing roster table if it exists and has the old schema
-- (We're replacing it with a simpler PDF-based approach)
DROP TABLE IF EXISTS roster CASCADE;

CREATE TABLE roster_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date) -- Only one roster PDF per date
);

-- Enable RLS
ALTER TABLE roster_images ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read roster PDFs
CREATE POLICY "Authenticated users can read roster PDFs" ON roster_images
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert/update/delete
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

CREATE TRIGGER update_roster_images_updated_at
  BEFORE UPDATE ON roster_images
  FOR EACH ROW
  EXECUTE FUNCTION update_roster_images_updated_at();

-- Create index on date for faster queries
CREATE INDEX idx_roster_images_date ON roster_images(date DESC);

