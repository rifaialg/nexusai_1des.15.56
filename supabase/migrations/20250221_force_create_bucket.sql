-- Force Create 'uploads' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads', 
  'uploads', 
  false, 
  52428800, -- 50MB limit
  ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/gif'];

-- Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (Error 42501 prevention)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can select their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create secure policies
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text );

CREATE POLICY "Users can select their own files"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text );

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text );

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text );
