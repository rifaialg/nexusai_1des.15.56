/*
  # Fix Storage & Schema (Safe Mode)
  
  ## Query Description:
  Operasi ini memperbaiki struktur database dan storage dengan aman:
  1. Membuat tabel 'generated_videos' jika belum ada.
  2. Membuat bucket storage 'uploads' (Private) untuk menyimpan gambar.
  3. Menerapkan kebijakan keamanan (RLS) tanpa mengganggu tabel sistem.
  
  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true
*/

-- 1. Setup Tabel generated_videos (Public Schema)
CREATE TABLE IF NOT EXISTS public.generated_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    task_id TEXT NOT NULL,
    prompt TEXT,
    status TEXT DEFAULT 'waiting',
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    meta_data JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS pada tabel public (Aman)
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

-- Policies untuk generated_videos (Menggunakan DO block untuk safety)
DO $$
BEGIN
    -- View Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'generated_videos' AND policyname = 'Users can view their own videos'
    ) THEN
        CREATE POLICY "Users can view their own videos" ON public.generated_videos FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Insert Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'generated_videos' AND policyname = 'Users can insert their own videos'
    ) THEN
        CREATE POLICY "Users can insert their own videos" ON public.generated_videos FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Update Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'generated_videos' AND policyname = 'Users can update their own videos'
    ) THEN
        CREATE POLICY "Users can update their own videos" ON public.generated_videos FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 2. Setup Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies (Hanya Insert/Select, tanpa Alter Table)
DO $$
BEGIN
    -- Policy: Upload (Insert)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can upload files'
    ) THEN
        CREATE POLICY "Authenticated users can upload files" 
        ON storage.objects FOR INSERT 
        TO authenticated 
        WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    -- Policy: View (Select)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can view files'
    ) THEN
        CREATE POLICY "Authenticated users can view files" 
        ON storage.objects FOR SELECT 
        TO authenticated 
        USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END
$$;
