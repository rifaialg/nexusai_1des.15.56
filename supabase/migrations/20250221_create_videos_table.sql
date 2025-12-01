/*
  # Create Generated Videos Table
  
  ## Query Description:
  Membuat tabel untuk menyimpan riwayat generasi video user.
  
  ## Structure Details:
  - Table: generated_videos
  - Columns: id, user_id, task_id, prompt, status, video_url, meta_data, created_at
  
  ## Security Implications:
  - RLS Enabled: User hanya bisa melihat video mereka sendiri.
*/

create table if not exists public.generated_videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  task_id text not null,
  prompt text not null,
  status text default 'waiting' check (status in ('waiting', 'processing', 'success', 'fail')),
  video_url text,
  cover_url text,
  meta_data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.generated_videos enable row level security;

-- Policies
create policy "Users can view their own videos"
  on public.generated_videos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own videos"
  on public.generated_videos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own videos"
  on public.generated_videos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own videos"
  on public.generated_videos for delete
  using (auth.uid() = user_id);
