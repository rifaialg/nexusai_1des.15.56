/*
  # Safe Setup for NexVideo
  
  ## Query Description:
  This migration safely sets up the database tables and storage buckets required for the application.
  It uses conditional checks (IF NOT EXISTS) to avoid permission errors (42501) that occur when trying to modify system-owned objects.
  
  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Table: public.generated_videos
  - Bucket: uploads (Private)
  - Policies: RLS for tables and storage
*/

-- 1. Create Videos Table (If not exists)
CREATE TABLE IF NOT EXISTS public.generated_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    task_id TEXT NOT NULL,
    prompt TEXT,
    status TEXT DEFAULT 'waiting',
    video_url TEXT,
    meta_data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on Videos Table
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

-- 3. Safely Create Policies for Videos Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_videos' AND policyname = 'Users can view own videos') THEN
        CREATE POLICY "Users can view own videos" ON public.generated_videos FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_videos' AND policyname = 'Users can insert own videos') THEN
        CREATE POLICY "Users can insert own videos" ON public.generated_videos FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generated_videos' AND policyname = 'Users can update own videos') THEN
        CREATE POLICY "Users can update own videos" ON public.generated_videos FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Create Storage Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false) -- Private bucket for security
ON CONFLICT (id) DO NOTHING;

-- 5. Safely Create Storage Policies (Avoids 42501 Error by not dropping)
DO $$
BEGIN
    -- Insert Policy (Upload)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Uploads') THEN
        CREATE POLICY "Allow Uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads' AND auth.uid() = owner);
    END IF;

    -- Select Policy (View)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Select Own') THEN
        CREATE POLICY "Allow Select Own" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'uploads' AND auth.uid() = owner);
    END IF;

    -- Update Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Update Own') THEN
        CREATE POLICY "Allow Update Own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'uploads' AND auth.uid() = owner);
    END IF;
    
     -- Delete Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Delete Own') THEN
        CREATE POLICY "Allow Delete Own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND auth.uid() = owner);
    END IF;
END $$;
