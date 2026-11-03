# MicDrop AI

An AI podcast studio that turns a topic, prompt, or document into an editable, multilingual,
multi-speaker episode with **real Sarvam AI voices** — then renders a downloadable WAV in the
browser.

Built with Next.js 15 App Router, TypeScript, Tailwind CSS, Sarvam-105B for script writing,
Bulbul v4 Flash for speech, Mayura for translation, and IndexedDB + Supabase for episode storage.

---

## What works

- **Topic → script**, **prompt → script**, **PDF/DOCX/TXT → script**, and paste-text → script
- **Real script generation** through Sarvam-105B (`/v2/chat/completions`, with V1 fallback),
  validated server-side with Zod and up to 3 automatic repair retries
- **Structured multi-speaker dialogue** (1–3 hosts), six conversation styles, language, audience,
  depth, and duration controls. Dialogue is written in the target language's native script
- **Professional script editor**: edit, add/delete turns, reassign speakers, AI-rewrite a single
  turn, rewrite the whole script, and translate the script into another supported language
- **Real Bulbul audio generation** per turn, with visible per-segment progress, retry, cancellation,
  and cached completed turns so a retry only re-renders what failed
- **Browser audio assembly**: decoded with Web Audio, concatenated with natural gaps, optional
  background-music bed with fade-in/out, mixed with Web Audio, soft-limited to prevent clipping,
  and exported as a proper 16-bit PCM WAV
- **Persistent player**: play/pause, seek, timestamps, volume, playback speed (0.75×–2×), WAV download
- **Episode library** in IndexedDB (local) with optional Supabase sync (cloud): reopen, replay,
  download, and delete episodes across refreshes and devices
- **Voice Studio** with real generated previews from the official Bulbul speaker catalogue
- **Authentication**: Sign up, sign in, sign out with Supabase Auth; protected routes and RLS
- **Error boundaries**: Crash protection with graceful reload
- Responsive Apple-inspired dark studio UI with loading, empty, success, and error states

### Honest limitations

- **No live web research.** Sarvam-105B writes from model knowledge and the supplied source. The
  UI labels every script as AI-generated background and tells users not to treat it as verified
  reporting. No search provider is connected.
- **Supabase optional:** Episodes are stored in IndexedDB by default. Add Supabase credentials
  to enable cloud sync and cross-device access.
- **Sarvam account access matters.** `/v2/chat/completions` may require beta access; the server
  automatically falls back to `/v1/chat/completions`. If your key or credits are unavailable, the
  app reports the upstream error instead of faking success.
- **Malayalam uses Bulbul v3.** The v4 Flash persona catalogue does not document Malayalam voices
  yet; the app routes that language to `bulbul:v3` with the documented `shubh` / `ishita` voices.
- **TTS output is MP3 segment audio**, decoded in the browser and exported as WAV. This keeps each
  serverless response under Vercel's payload limits.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
```

Edit `.env.local`:

```env
SARVAM_API_KEY=your_real_sarvam_key
SARVAM_BASE_URL=https://api.sarvam.ai
SARVAM_CHAT_MODEL=sarvam-105b
SARVAM_TTS_MODEL=bulbul:v4-flash

# Optional: Supabase for cloud persistence
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

```bash
npm run dev
```

Open http://localhost:3000.

The Sarvam key is **server-only**. It is never exposed through `NEXT_PUBLIC_*`, never printed in
logs, and never returned by an API route.

### Verify the integration

1. Open **Settings** — the Sarvam connection card should read “API key detected”
2. Create a 2-minute episode on any topic and generate the script
3. Edit one turn, rewrite another with AI, then generate audio
4. Listen in the bottom player and download the WAV
5. Refresh and reopen the episode from **My Episodes**
6. Optionally upload background music before rendering and confirm it is mixed
7. Sign up/sign in to sync episodes to Supabase (if configured)

If credits are exhausted or the key is invalid, every action surfaces a clear error toast; nothing
is simulated.

---

## Documentation

| Document | Path | Description |
|----------|------|-------------|
| Project Audit | `docs/PROJECT_AUDIT.md` | Baseline findings and issues |
| Architecture | `docs/ARCHITECTURE.md` | System design and data flow |
| Database | `docs/DATABASE.md` | Schema, RLS, storage buckets |
| API | `docs/API.md` | All route handlers and contracts |
| Deployment | `docs/DEPLOYMENT.md` | Vercel setup and env vars |
| Security | `docs/SECURITY.md` | Security model and protections |
| Testing | `docs/TESTING.md` | Test strategy and results |

---

## Build & quality checks

```bash
npm run typecheck   # TypeScript strict mode
npm run build       # Production build (Vercel-ready)
npm run start       # Production server
npx vitest run      # Unit tests (40 tests)
npx playwright test # E2E tests (requires dev server)
```

`npm run build` must pass before deploying. The app is Vercel-ready: all AI calls happen in Node
route handlers, storage is client-side IndexedDB with optional Supabase sync, and no long-running
process is required.

---

## Deploy to Vercel

1. Push the repository to GitHub with this app at the repo root on `main`
2. Import the repository at https://vercel.com/new
3. Add environment variables under **Settings → Environment Variables** for Production and Preview:
   - `SARVAM_API_KEY` (required)
   - `NEXT_PUBLIC_SUPABASE_URL` (optional, for cloud persistence)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)
   - `SUPABASE_SERVICE_ROLE_KEY` (optional, server-only)
4. Apply Supabase migration (`supabase/migrations/001_initial_schema.sql`) to your project
5. Create storage buckets in Supabase (`podcast-documents`, `podcast-audio`, `podcast-covers`)
6. Deploy
7. Open the production URL and run the verification checklist above

Do not commit `.env.local`. It is already ignored; `.env.example` documents the required keys.

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Icons | Lucide |
| Script AI | Sarvam-105B |
| Voice AI | Sarvam Bulbul v4 Flash (v3 for Malayalam) |
| Translation | Sarvam Mayura v1 |
| Documents | PDF.js + Mammoth |
| Audio | Web Audio API + custom WAV encoder |
| Local Storage | IndexedDB |
| Cloud Storage | Supabase (PostgreSQL, Auth, Storage) |
| Deployment | Vercel |

---

## Testing

- **Unit tests:** 40 tests across 6 files (vitest) — all passing
- **E2E tests:** 5 tests (Playwright) — page loading and navigation
- **TypeScript:** Strict mode, zero errors
- **Production build:** Passing

---

Built for the MicDrop AI studio. Every generate button is wired to a real API call.