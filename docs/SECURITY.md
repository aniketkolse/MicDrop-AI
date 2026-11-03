# MicDrop AI — Security

## Security Overview

MicDrop AI follows security best practices to protect user data, API keys, and application integrity.

## API Key Security

### Sarvam AI API Key

- **Storage:** Stored in `SARVAM_API_KEY` environment variable (server-only)
- **Exposure:** Never exposed to browser code via `NEXT_PUBLIC_*` prefix
- **Logging:** Never logged or returned in API responses
- **Git:** `.env.local` is gitignored; never committed to version control
- **Vercel:** Configured as server-side environment variable

### Supabase Keys

| Key | Exposure | Storage |
|-----|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | `.env.local` + Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe | `.env.local` + Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | `.env.local` + Vercel (server-only) |

## Authentication

- Provider: Supabase Auth
- Method: Email + password
- Session: Cookie-based via `@supabase/ssr`
- Session refresh: Handled by middleware
- Protected routes: API routes verify user identity from session
- Client-side auth state: Managed by StudioProvider context

## Authorization

### Row Level Security (RLS)

All database tables have RLS enabled:

| Table | Policy | Check |
|-------|--------|-------|
| profiles | select/insert/update | `auth.uid() = id` |
| podcasts | select/insert/update/delete | `auth.uid() = user_id` |
| podcast_speakers | select/insert/update/delete | `auth.uid() = user_id` |
| podcast_segments | select/insert/update/delete | `auth.uid() = user_id` |
| generation_jobs | select/insert/update/delete | `auth.uid() = user_id` |
| user_settings | select/insert/update/delete | `auth.uid() = user_id` |

### Storage Security

All storage buckets are private with ownership-based RLS:

| Bucket | Policy | Path Pattern |
|--------|--------|-------------|
| podcast-documents | User owns files | `{user_id}/{podcast_id}/source/{filename}` |
| podcast-audio | User owns files | `{user_id}/{podcast_id}/audio/{filename}` |
| podcast-covers | User owns files | `{user_id}/{podcast_id}/cover/{filename}` |

Storage policies verify `auth.uid()::text = (storage.foldername(name))[1]`.

## API Security

- All mutation endpoints require authentication
- User identity derived from Supabase session (not client-supplied)
- Ownership verified for all CRUD operations
- Input validation via Zod schemas
- Request timeouts on all external calls
- Bounded retries on transient failures
- Safe error messages (no raw upstream payloads or keys leaked)

## File Upload Security

- File type validation (MIME types checked)
- File size limits enforced (10 MB documents, 50 MB audio, 5 MB covers)
- No executable file types allowed
- Files stored in private Supabase buckets
- Signed URLs for download (time-limited)

## Dependencies

Dependencies are managed via `package.json` and `package-lock.json`. Run `npm audit` to check for vulnerabilities.

## Secrets Management

- `.env.local` is gitignored
- `.env.example` contains placeholder values only
- No secrets in Git history
- No secrets in logs
- No secrets in browser bundles

## Incident Response

If a credential is compromised:

1. Rotate the key immediately (Sarvam dashboard or Supabase dashboard)
2. Update the environment variable in Vercel
3. Redeploy the application
4. Review access logs for unauthorized access

## Security Headers

Next.js automatically applies security headers. Custom headers can be added in `next.config.ts` if needed.