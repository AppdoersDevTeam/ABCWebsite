-- Create Storage Bucket for Team Member Images
-- This bucket stores team member profile images (PNG, JPEG, PDF files)

-- Note: Run this in Supabase SQL Editor or via Supabase CLI

-- Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-images', 'team-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public to read team images
CREATE POLICY "Public can read team images"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-images');

-- Policy: Allow authenticated users to upload team images
CREATE POLICY "Authenticated users can upload team images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'team-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update team images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'team-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to delete team images
CREATE POLICY "Authenticated users can delete team images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'team-images' 
  AND auth.role() = 'authenticated'
);

