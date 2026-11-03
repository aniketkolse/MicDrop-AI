# MicDrop AI — Deployment

## Vercel Deployment

MicDrop AI is configured for deployment on Vercel with zero configuration.

### Prerequisites

1. GitHub repository with the MicDrop AI code
2. Vercel account
3. Sarvam AI API key
4. Supabase project (optional, for cloud persistence)

### Deployment Steps

1. Push the repository to GitHub on the `main` branch
2. Import the repository at https://vercel.com/new
3. Vercel will auto-detect Next.js 15 App Router
4. Add environment variables in Vercel Settings → Environment Variables
5. Deploy

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SARVAM_API_KEY` | Yes | Sarvam AI API key (server-only) | `sk_...` |
| `SARVAM_BASE_URL` | No | Sarvam API base URL | `https://api.sarvam.ai` |
| `SARVAM_CHAT_MODEL` | No | Chat model ID | `sarvam-105b` |
| `SARVAM_TTS_MODEL` | No | TTS model ID | `bulbul:v4-flash` |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL | `https://...supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key | `...` |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key (server-only) | `...` |

**Important:** Never prefix Sarvam API key with `NEXT_PUBLIC_`. It must remain server-only.

### Build Configuration

- Build command: `next build`
- Output: Next.js automatic
- Framework: Next.js 15 App Router
- Node.js version: 18+

### Runtime Limits

- Function timeout: 60 seconds (configured in API routes)
- Request payload: Default Vercel limits apply
- Audio generation: Segmented to stay within limits

### Environment Scopes

Configure variables for both Production and Preview environments.

### Deployment Readiness Checklist

- [ ] `npm run build` passes
- [ ] `tsc --noEmit` passes
- [ ] `vitest run` passes (40 tests)
- [ ] `SARVAM_API_KEY` added to Vercel
- [ ] Supabase credentials added (if using cloud persistence)
- [ ] Supabase migration applied to project
- [ ] Storage buckets created in Supabase
- [ ] Test production deployment with a short episode

## Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
# Open http://localhost:3000
```

## IndexedDB vs Supabase

- **Without Supabase credentials:** Episodes stored in IndexedDB (local only, no cross-device sync)
- **With Supabase credentials:** Episodes synced to Supabase (cloud persistence, cross-device access)

IndexedDB is always used as a local cache, even when Supabase is configured.