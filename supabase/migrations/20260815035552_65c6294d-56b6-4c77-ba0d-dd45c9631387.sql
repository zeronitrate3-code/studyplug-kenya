CREATE POLICY "dm_media_insert_own_folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dm-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "dm_media_read_authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'dm-media');

CREATE POLICY "dm_media_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'dm-media' AND (storage.foldername(name))[1] = auth.uid()::text);