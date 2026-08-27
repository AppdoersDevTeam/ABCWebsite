-- Devotional of the Week — table + storage bucket + RLS
-- Run in Supabase SQL Editor (or applied via migration create_devotionals)

CREATE TABLE IF NOT EXISTS public.devotionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  week_date DATE NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read devotionals" ON public.devotionals;
CREATE POLICY "Authenticated users can read devotionals" ON public.devotionals
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage devotionals" ON public.devotionals;
CREATE POLICY "Admins can manage devotionals" ON public.devotionals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_approved = true
    )
  );

GRANT SELECT ON public.devotionals TO authenticated;
GRANT ALL ON public.devotionals TO postgres, service_role;

-- Storage bucket for weekly PDF files
INSERT INTO storage.buckets (id, name, public)
VALUES ('devotionals', 'devotionals', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read devotionals" ON storage.objects;
CREATE POLICY "Public can read devotionals"
ON storage.objects FOR SELECT
USING (bucket_id = 'devotionals');

DROP POLICY IF EXISTS "Authenticated users can upload devotionals" ON storage.objects;
CREATE POLICY "Authenticated users can upload devotionals"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'devotionals'
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Authenticated users can update devotionals" ON storage.objects;
CREATE POLICY "Authenticated users can update devotionals"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'devotionals'
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Authenticated users can delete devotionals" ON storage.objects;
CREATE POLICY "Authenticated users can delete devotionals"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'devotionals'
  AND auth.role() = 'authenticated'
);
