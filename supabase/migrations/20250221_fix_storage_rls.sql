/*
  # Fix Storage RLS Permissions
  Fixes "new row violates row-level security policy" error.

  ## Query Description:
  1. Ensures 'uploads' bucket exists and is public.
  2. Enables RLS on storage.objects.
  3. Drops old policies to prevent conflicts.
  4. Creates comprehensive policies for INSERT, SELECT, UPDATE, DELETE for authenticated users.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "High" (Enables file uploads)
  - Requires-Backup: false
*/

-- 1. Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on objects (standard safety measure)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies for this bucket to prevent conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ov1k1_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ov1k1_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ov1k1_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ov1k1_3" ON storage.objects;

-- 4. Create Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- 5. Create Policy: Allow public read access (required for public URLs)
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- 6. Create Policy: Allow users to update their own files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads' AND owner = auth.uid());

-- 7. Create Policy: Allow users to delete their own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND owner = auth.uid());
