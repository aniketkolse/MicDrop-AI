# MicDrop AI — Database Schema

## Overview

MicDrop AI uses Supabase PostgreSQL as its cloud database for authenticated users. IndexedDB is used as a local fallback for unauthenticated users and offline storage.

## Tables

### profiles
Stores user profile information created automatically on signup.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, references auth.users | User ID |
| display_name | text | nullable | User's display name |
| avatar_url | text | nullable | User's avatar URL |
| created_at | timestamptz | default now() | Creation timestamp |
| updated_at | timestamptz | default now() | Last update timestamp |

### podcasts
Stores podcast episode metadata and scripts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Podcast ID |
| user_id | uuid | FK auth.users, not null | Owner user ID |
| title | text | not null | Podcast title |
| description | text | nullable | Episode description |
| original_prompt | text | nullable | Original topic/prompt |
| source_type | text | nullable | Source type (topic/prompt/document/text) |
| source_document_path | text | nullable | Path to uploaded document |
| language | text | nullable | Episode language code |
| duration_seconds | integer | nullable | Planned duration in seconds |
| conversation_style | text | nullable | Conversation style |
| target_audience | text | nullable | Target audience |
| status | text | default 'draft', CHECK constraint | Draft/generating_script/script_ready/generating_audio/completed/failed |
| script | jsonb | nullable | Generated script JSON |
| audio_path | text | nullable | Path to final WAV in storage |
| audio_format | text | nullable | Audio format |
| audio_duration_seconds | integer | nullable | Actual audio duration |
| created_at | timestamptz | default now() | Creation timestamp |
| updated_at | timestamptz | default now() | Last update timestamp |

### podcast_speakers
Stores speaker information for each podcast.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Speaker ID |
| podcast_id | uuid | FK podcasts, not null, cascade | Parent podcast |
| user_id | uuid | FK auth.users, not null, cascade | Owner user ID |
| speaker_name | text | not null | Speaker display name |
| speaker_role | text | nullable | Speaker role (host, co-host, guest) |
| voice_id | text | nullable | Sarvam Bulbul voice ID |
| language | text | nullable | Speaker language code |
| speaking_rate | numeric | nullable | Speaking pace multiplier |
| created_at | timestamptz | default now() | Creation timestamp |

### podcast_segments
Stores individual dialogue segments for each podcast.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Segment ID |
| podcast_id | uuid | FK podcasts, not null, cascade | Parent podcast |
| speaker_id | uuid | FK podcast_speakers, set null | Speaker reference |
| user_id | uuid | FK auth.users, not null, cascade | Owner user ID |
| sequence_number | integer | not null | Segment order |
| heading | text | nullable | Segment heading |
| dialogue | text | nullable | Dialogue text |
| audio_path | text | nullable | Path to segment audio in storage |
| status | text | default 'pending', CHECK | pending/generating/done/failed |
| duration_seconds | numeric | nullable | Segment duration |
| created_at | timestamptz | default now() | Creation timestamp |
| updated_at | timestamptz | default now() | Last update timestamp |

### generation_jobs
Tracks generation job status and progress.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Job ID |
| podcast_id | uuid | FK podcasts, cascade | Related podcast |
| user_id | uuid | FK auth.users, not null, cascade | Owner user ID |
| job_type | text | not null, CHECK | script/audio/translation/rewrite |
| status | text | default 'pending', CHECK | pending/running/completed/failed |
| progress | integer | default 0, CHECK 0-100 | Progress percentage |
| error_message | text | nullable | Error details if failed |
| started_at | timestamptz | nullable | Job start time |
| completed_at | timestamptz | nullable | Job completion time |
| created_at | timestamptz | default now() | Creation timestamp |

### user_settings
Stores user preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Settings ID |
| user_id | uuid | unique, FK auth.users, not null | Owner user ID |
| default_language | text | nullable | Default language |
| default_voice | text | nullable | Default voice ID |
| default_podcast_style | text | nullable | Default conversation style |
| preferred_theme | text | default 'dark' | UI theme preference |
| created_at | timestamptz | default now() | Creation timestamp |
| updated_at | timestamptz | default now() | Last update timestamp |

## Indexes

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| idx_podcasts_user_id | podcasts | user_id | Query by user |
| idx_podcasts_status | podcasts | status | Filter by status |
| idx_podcasts_created_at | podcasts | created_at DESC | Sort by recency |
| idx_podcasts_user_status | podcasts | user_id, status | User + status filter |
| idx_podcast_speakers_podcast_id | podcast_speakers | podcast_id | Query by podcast |
| idx_podcast_speakers_user_id | podcast_speakers | user_id | Query by user |
| idx_podcast_segments_podcast_id | podcast_segments | podcast_id | Query by podcast |
| idx_podcast_segments_user_id | podcast_segments | user_id | Query by user |
| idx_podcast_segments_seq | podcast_segments | podcast_id, sequence_number | Ordered segment retrieval |
| idx_podcast_segments_status | podcast_segments | status | Filter by status |
| idx_generation_jobs_podcast_id | generation_jobs | podcast_id | Query by podcast |
| idx_generation_jobs_user_id | generation_jobs | user_id | Query by user |
| idx_generation_jobs_status | generation_jobs | status | Filter by status |
| idx_user_settings_user_id | user_settings | user_id | Query by user |

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **profiles**: Users can only select/insert/update their own profile
- **podcasts**: Users can only CRUD their own podcasts (checked via `user_id`)
- **podcast_speakers**: Users can only CRUD their own speakers (checked via `user_id`)
- **podcast_segments**: Users can only CRUD their own segments (checked via `user_id`)
- **generation_jobs**: Users can only CRUD their own jobs (checked via `user_id`)
- **user_settings**: Users can only CRUD their own settings (checked via `user_id`)

Policies are created idempotently using `DO $$ ... END $$` blocks with `DROP POLICY IF EXISTS` + `CREATE POLICY`.

## Storage Buckets

| Bucket | Public | Max Size | Allowed MIME Types |
|--------|--------|----------|-------------------|
| podcast-documents | No | 10 MB | PDF, DOCX, DOC, TXT |
| podcast-audio | No | 50 MB | WAV, MP3, MP4 |
| podcast-covers | No | 5 MB | PNG, JPEG, WebP, SVG |

Storage paths follow the pattern: `{user_id}/{podcast_id}/{type}/{filename}`

RLS policies on `storage.objects` ensure users can only access files under their own `user_id` prefix.

## Triggers

| Trigger | Table | Function | Timing |
|---------|-------|----------|--------|
| update_profiles_updated_at | profiles | handle_updated_at | BEFORE UPDATE |
| update_podcasts_updated_at | podcasts | handle_updated_at | BEFORE UPDATE |
| update_podcast_speakers_updated_at | podcast_speakers | handle_updated_at | BEFORE UPDATE |
| update_podcast_segments_updated_at | podcast_segments | handle_updated_at | BEFORE UPDATE |
| update_generation_jobs_updated_at | generation_jobs | handle_updated_at | BEFORE UPDATE |
| update_user_settings_updated_at | user_settings | handle_updated_at | BEFORE UPDATE |
| on_auth_user_created | auth.users | handle_new_user | AFTER INSERT |

The `handle_new_user` function automatically creates a `profiles` row when a new user signs up.

## Migrations

- `supabase/migrations/001_initial_schema.sql` - Core schema, RLS, triggers
- `supabase/migrations/002_storage_buckets.sql` - Storage buckets and policies

Migrations are idempotent and safe to re-run.