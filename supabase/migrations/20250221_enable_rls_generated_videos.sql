/*
  # Security Fix: Enable RLS for generated_videos
  
  ## Query Description:
  This migration enables Row Level Security (RLS) on the 'generated_videos' table to prevent unauthorized access.
  It adds policies to ensure users can only view, insert, and update their own video jobs.

  ## Metadata:
  - Schema-Category: "Security"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Security Implications:
  - RLS Status: Enabled
  - Policy Changes: Yes (Select, Insert, Update policies added)
*/

-- Enable RLS
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT (Users can see their own videos)
CREATE POLICY "Users can view own videos" 
ON public.generated_videos 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for INSERT (Users can create videos)
CREATE POLICY "Users can insert own videos" 
ON public.generated_videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE (Users can update their own videos - e.g. status updates)
CREATE POLICY "Users can update own videos" 
ON public.generated_videos 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy for DELETE (Users can delete their own videos)
CREATE POLICY "Users can delete own videos" 
ON public.generated_videos 
FOR DELETE 
USING (auth.uid() = user_id);
