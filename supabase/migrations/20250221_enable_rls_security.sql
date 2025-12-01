/*
  # Security Hardening: Enable RLS for Generated Videos
  
  ## Query Description:
  This migration enables Row Level Security (RLS) on the 'generated_videos' table and adds policies to ensure data isolation.
  - Users can only SELECT their own videos.
  - Users can only INSERT videos with their own user_id.
  - Users can only UPDATE their own videos.
  - Users can only DELETE their own videos.

  ## Metadata:
  - Schema-Category: "Security"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes (4 policies added)
  - Auth Requirements: Authenticated users only
*/

-- Enable RLS
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT (Read)
CREATE POLICY "Users can view own videos" 
ON public.generated_videos 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for INSERT (Create)
CREATE POLICY "Users can create own videos" 
ON public.generated_videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE (Edit)
CREATE POLICY "Users can update own videos" 
ON public.generated_videos 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy for DELETE (Remove)
CREATE POLICY "Users can delete own videos" 
ON public.generated_videos 
FOR DELETE 
USING (auth.uid() = user_id);
