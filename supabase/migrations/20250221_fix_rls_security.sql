/*
  # Fix RLS Policies (Idempotent)
  
  Skrip ini aman dijalankan berulang kali. 
  Ia akan menghapus kebijakan yang ada terlebih dahulu untuk menghindari error "policy already exists".
*/

-- Pastikan RLS aktif
ALTER TABLE "generated_videos" ENABLE ROW LEVEL SECURITY;

-- Hapus kebijakan lama jika ada (Drop if exists)
DROP POLICY IF EXISTS "Users can view own videos" ON "generated_videos";
DROP POLICY IF EXISTS "Users can insert own videos" ON "generated_videos";
DROP POLICY IF EXISTS "Users can update own videos" ON "generated_videos";

-- Buat ulang kebijakan (Recreate)
CREATE POLICY "Users can view own videos" ON "generated_videos"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own videos" ON "generated_videos"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos" ON "generated_videos"
  FOR UPDATE USING (auth.uid() = user_id);
