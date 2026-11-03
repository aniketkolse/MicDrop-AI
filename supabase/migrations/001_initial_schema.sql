-- Enable extensions
create extension if not exists pgcrypto;

-- profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- podcasts table
create table if not exists public.podcasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  description text,
  original_prompt text,
  source_type text,
  source_document_path text,
  language text,
  duration_seconds integer,
  conversation_style text,
  target_audience text,
  status text default 'draft',
  script jsonb,
  audio_path text,
  audio_format text,
  audio_duration_seconds integer,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- podcast speakers
create table if not exists public.podcast_speakers (
  id uuid primary key default gen_random_uuid(),
  podcast_id uuid not null references public.podcasts on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  speaker_name text not null,
  speaker_role text,
  voice_id text,
  language text,
  speaking_rate numeric,
  created_at timestamptz default now() not null
);

-- podcast segments
create table if not exists public.podcast_segments (
  id uuid primary key default gen_random_uuid(),
  podcast_id uuid not null references public.podcasts on delete cascade,
  speaker_id uuid references public.podcast_speakers on delete set null,
  user_id uuid not null references auth.users on delete cascade,
  sequence_number integer not null,
  heading text,
  dialogue text,
  audio_path text,
  status text default 'pending',
  duration_seconds numeric,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- generation jobs
create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  podcast_id uuid references public.podcasts on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  job_type text not null,
  status text default 'pending',
  progress integer default 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now() not null
);

-- user settings
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users on delete cascade,
  default_language text,
  default_voice text,
  default_podcast_style text,
  preferred_theme text default 'dark',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- indexes
create index if not exists idx_podcasts_user_id on public.podcasts(user_id);
create index if not exists idx_podcasts_status on public.podcasts(status);
create index if not exists idx_podcasts_created_at on public.podcasts(created_at desc);
create index if not exists idx_podcast_speakers_podcast_id on public.podcast_speakers(podcast_id);
create index if not exists idx_podcast_segments_podcast_id on public.podcast_segments(podcast_id);
create index if not exists idx_podcast_segments_seq on public.podcast_segments(podcast_id, sequence_number);
create index if not exists idx_generation_jobs_podcast_id on public.generation_jobs(podcast_id);
create index if not exists idx_generation_jobs_user_id on public.generation_jobs(user_id);

-- updated_at triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'update_profiles_updated_at') then
    create trigger update_profiles_updated_at
    before update on public.profiles
    for each row execute procedure public.handle_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'update_podcasts_updated_at') then
    create trigger update_podcasts_updated_at
    before update on public.podcasts
    for each row execute procedure public.handle_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'update_podcast_segments_updated_at') then
    create trigger update_podcast_segments_updated_at
    before update on public.podcast_segments
    for each row execute procedure public.handle_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'update_user_settings_updated_at') then
    create trigger update_user_settings_updated_at
    before update on public.user_settings
    for each row execute procedure public.handle_updated_at();
  end if;
end $$;

-- profile creation trigger
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- handle_new_user function (idempotent guard handled by checking existence inside)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url, created_at, updated_at)
  values (new.id, new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'avatar_url', now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- enable row level security
alter table public.profiles enable row level security;
alter table public.podcasts enable row level security;
alter table public.podcast_speakers enable row level security;
alter table public.podcast_segments enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.user_settings enable row level security;

-- policies: profiles
create policy if not exists profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy if not exists profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy if not exists profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- policies: podcasts
create policy if not exists podcasts_select_own on public.podcasts
  for select using (auth.uid() = user_id);
create policy if not exists podcasts_insert_own on public.podcasts
  for insert with check (auth.uid() = user_id);
create policy if not exists podcasts_update_own on public.podcasts
  for update using (auth.uid() = user_id);
create policy if not exists podcasts_delete_own on public.podcasts
  for delete using (auth.uid() = user_id);

-- policies: podcast_speakers (verify ownership via podcast user_id)
create policy if not exists speakers_select_own on public.podcast_speakers
  for select using (auth.uid() = user_id);
create policy if not exists speakers_insert_own on public.podcast_speakers
  for insert with check (auth.uid() = user_id);
create policy if not exists speakers_update_own on public.podcast_speakers
  for update using (auth.uid() = user_id);
create policy if not exists speakers_delete_own on public.podcast_speakers
  for delete using (auth.uid() = user_id);

-- policies: podcast_segments
create policy if not exists segments_select_own on public.podcast_segments
  for select using (auth.uid() = user_id);
create policy if not exists segments_insert_own on public.podcast_segments
  for insert with check (auth.uid() = user_id);
create policy if not exists segments_update_own on public.podcast_segments
  for update using (auth.uid() = user_id);
create policy if not exists segments_delete_own on public.podcast_segments
  for delete using (auth.uid() = user_id);

-- policies: generation_jobs
create policy if not exists jobs_select_own on public.generation_jobs
  for select using (auth.uid() = user_id);
create policy if not exists jobs_insert_own on public.generation_jobs
  for insert with check (auth.uid() = user_id);
create policy if not exists jobs_update_own on public.generation_jobs
  for update using (auth.uid() = user_id);
create policy if not exists jobs_delete_own on public.generation_jobs
  for delete using (auth.uid() = user_id);

-- policies: user_settings
create policy if not exists settings_select_own on public.user_settings
  for select using (auth.uid() = user_id);
create policy if not exists settings_insert_own on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy if not exists settings_update_own on public.user_settings
  for update using (auth.uid() = user_id);
create policy if not exists settings_delete_own on public.user_settings
  for delete using (auth.uid() = user_id);
