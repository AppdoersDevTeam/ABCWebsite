-- Public People photos. The app uploaded to this bucket, but it was never
-- created in production, so Admin People saved photos as data URLs in
-- team_members.img and About / dashboard directory pages hung.

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('team-images', 'team-images', true, 1048576)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 1048576;

DROP POLICY IF EXISTS "public_read_team_images" ON storage.objects;
CREATE POLICY "public_read_team_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-images');

DROP POLICY IF EXISTS "auth_insert_team_images" ON storage.objects;
CREATE POLICY "auth_insert_team_images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'team-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "auth_update_team_images" ON storage.objects;
CREATE POLICY "auth_update_team_images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'team-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "auth_delete_team_images" ON storage.objects;
CREATE POLICY "auth_delete_team_images"
ON storage.objects FOR DELETE
USING (bucket_id = 'team-images' AND auth.role() = 'authenticated');
