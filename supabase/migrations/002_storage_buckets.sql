-- Storage buckets for MicDrop AI
-- These are private buckets; access is controlled by RLS policies below.

-- Create buckets (idempotent via DO block)
do $$
begin
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'podcast-documents',
    'podcast-documents',
    false,
    10485760, -- 10 MB
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  )
  on conflict (id) do nothing;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'podcast-audio',
    'podcast-audio',
    false,
    52428800, -- 50 MB
    ARRAY['audio/wav', 'audio/mpeg', 'audio/mp4']
  )
  on conflict (id) do nothing;

  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'podcast-covers',
    'podcast-covers',
    false,
    5242880, -- 5 MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
  )
  on conflict (id) do nothing;
end $$;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Storage policies: users can only access their own files
-- Path pattern: {user_id}/{podcast_id}/{type}/{filename}

do $$
begin
  -- podcast-documents: select own
  execute 'drop policy if exists documents_select_own on storage.objects';
  execute 'create policy documents_select_own on storage.objects for select using (bucket_id = ''podcast-documents'' and auth.uid()::text = (storage.foldername(name))[1])';

  -- podcast-documents: insert own
  execute 'drop policy if exists documents_insert_own on storage.objects';
  execute 'create policy documents_insert_own on storage.objects for insert with check (bucket_id = ''podcast-documents'' and auth.uid()::text = (storage.foldername(name))[1])';

  -- podcast-documents: update own
  execute 'drop policy if exists documents_update_own on storage.objects';
  execute 'create policy documents_update_own on storage.objects for update using (bucket_id = ''podcast-documents'' and auth.uid()::text = (storage.foldername(name))[1])';

  -- podcast-documents: delete own
  execute 'drop policy if exists documents_delete_own on storage.objects';
  execute 'create policy documents_delete_own on storage.objects for delete using (bucket_id = ''podcast-documents'' and auth.uid()::text = (storage.foldername(name))[1])';

  -- podcast-audio: select own
  execute 'drop policy if exists audio_select_own on storage.objects';
  execute 'create policy audio_select_own on storage.objects for select using (bucket_id = ''podcast-audio'' and auth.uid()::text = (storage.foldername(name))[1])';

  -- podcast-audio: insert own
  execute 'drop policy if exists audio_insert_own on storage.objects';
  execute 'create policy audio_insert_own on storage.objects for insert with check (bucket_id = ''podcast-audio'' and auth.uid()::text = (storage.foldername(name))[1])';

  -- podcast-audio: update own
  execute 'drop policy if exists audio_update_own on storage.objects';
  execute 'create policy audio_update_own on storage.objects for update using (bucket_id = ''podcast-audio'' and auth.uid()::text = (storage.foldername(name))[1])';

  -- podcast-audio: delete own
  execute 'drop policy if exists audio_delete_own on storage.objects';
  execute 'create policy audio_delete_own on storage.objects for delete using (bucket_id = ''podcast-audio'' and auth.uid()::text = (storage.foldername(name))[1])';

  -- podcast-covers: select own
  execute 'drop policy if exists covers_select_own on storage.objects';
  execute 'create policy covers_select_own on storage.objects for select using (bucket_id = ''podcast-covers'' and auth.uid()::text = (storage.foldername(name))[1])';

  -- podcast-covers: insert own
  execute 'drop policy if exists covers_insert_own on storage.objects';
  execute 'create policy covers_insert_own on storage.objects for insert with check (bucket_id = ''podcast-covers'' and auth.uid()::text = (storage.foldername(name))[1])';

  -- podcast-covers: update own
  execute 'drop policy if exists covers_update_own on storage.objects';
  execute 'create policy covers_update_own on storage.objects for update using (bucket_id = ''podcast-covers'' and auth.uid()::text = (storage.foldername(name))[1])';

  -- podcast-covers: delete own
  execute 'drop policy if exists covers_delete_own on storage.objects';
  execute 'create policy covers_delete_own on storage.objects for delete using (bucket_id = ''podcast-covers'' and auth.uid()::text = (storage.foldername(name))[1])';
end $$;
