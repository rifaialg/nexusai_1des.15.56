/*
# Create Storage Bucket 'uploads'
Creates the required storage bucket for the application to store user assets.

## Query Description:
1. Creates a private storage bucket named 'uploads'.
2. Sets file size limits (50MB) and allowed MIME types (images/videos).
3. Configures Row Level Security (RLS) policies to ensure users can only access their own files.

## Metadata:
- Schema-Category: "Storage"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Bucket: uploads
- Policies: Insert, Select, Update, Delete for authenticated users
*/

-- 1. Create the 'uploads' bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads', 
  'uploads', 
  false, -- Private bucket (Secure)
  52428800, -- 50MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];

-- 2. Enable RLS on objects (Standard Supabase Security)
alter table storage.objects enable row level security;

-- 3. Drop existing policies to prevent conflicts during re-runs
drop policy if exists "Authenticated users can upload files" on storage.objects;
drop policy if exists "Users can view their own files" on storage.objects;
drop policy if exists "Users can update their own files" on storage.objects;
drop policy if exists "Users can delete their own files" on storage.objects;

-- 4. Create Policies

-- Allow authenticated users to upload files to their own folder (folder name must match user ID)
create policy "Authenticated users can upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'uploads' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view/download their own files
create policy "Users can view their own files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'uploads' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
create policy "Users can update their own files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'uploads' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
create policy "Users can delete their own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'uploads' 
  and auth.uid()::text = (storage.foldername(name))[1]
);
