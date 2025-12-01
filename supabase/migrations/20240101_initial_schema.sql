-- Create Profiles table (extends Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  credits integer default 1000,
  kie_api_key text, -- Stored encrypted in real app, plain for demo
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  brand text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Assets table
create table public.assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  type text check (type in ('image', 'video')),
  url text not null,
  label text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Video Jobs table
create table public.video_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  mode text check (mode in ('basic', 'pro', 'storyboard', 'duplicate')),
  prompt_text text,
  provider_model text,
  status text check (status in ('queued', 'processing', 'completed', 'failed')) default 'queued',
  kie_job_id text,
  output_url text,
  duration_seconds integer,
  aspect_ratio text,
  resolution text,
  credits_spent integer default 0,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Saved Prompts table
create table public.saved_prompts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  tags text[],
  mode text,
  payload_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Basic)
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

alter table public.products enable row level security;
create policy "Users can view own products" on public.products for select using (auth.uid() = user_id);
create policy "Users can insert own products" on public.products for insert with check (auth.uid() = user_id);

alter table public.video_jobs enable row level security;
create policy "Users can view own jobs" on public.video_jobs for select using (auth.uid() = user_id);
create policy "Users can insert own jobs" on public.video_jobs for insert with check (auth.uid() = user_id);
create policy "Users can update own jobs" on public.video_jobs for update using (auth.uid() = user_id);
