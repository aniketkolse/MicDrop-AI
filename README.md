# MicDrop AI

An AI podcast studio that turns a topic, prompt, or document into an editable, multilingual,
multi-speaker episode with **real Sarvam AI voices** — then renders a downloadable WAV in the
browser.

Built with Next.js App Router, TypeScript, Tailwind CSS, Sarvam-105B for script writing, Bulbul v4
Flash for speech, and IndexedDB for local episode history.

---

## What actually works

- **Topic → script**, **prompt → script**, **PDF/DOCX/TXT → script**, and paste-text → script.
- **Real script generation** through Sarvam-105B (`/v2/chat/completions`, with a V1 fallback),
  validated server-side with Zod and one automatic repair retry.
- **Structured multi-speaker dialogue** (1–3 hosts), six conversation styles, language, audience,
  depth, and duration controls. Dialogue is written in the target language's native script.
- **Professional script editor**: edit, add/delete turns, reassign speakers, AI-rewrite a single
  turn, rewrite the whole script, and translate the script into another supported language.
- **Real Bulbul audio generation** per turn, with visible per-segment progress, retry, cancellation,
  and cached completed turns so a retry only re-renders what failed.
- **Browser audio assembly**: decoded with Web Audio, concatenated with natural gaps, optional
  background-music bed, mixed with Web Audio, and exported as a proper 16-bit PCM WAV.
- **Persistent player**: play/pause, seek, timestamps, volume, playback speed, and WAV download.
- **Episode library** in IndexedDB: reopen, replay, download, and delete episodes across refreshes.
- **Voice Studio** with real generated previews from the official speaker catalogue.
- Responsive dark studio UI with loading, empty, success, and error states.

### Honest limitations

- **No live web research.** Sarvam-105B writes from model knowledge and the supplied source. The
  UI labels every script as AI-generated background and tells users not to treat it as verified
  reporting. No search provider is connected.
- **No server-side persistence.** Episodes live in the browser's IndexedDB by design (Vercel's
  filesystem is temporary). They do not sync across devices.
- **No authentication or billing.** This is a single-user studio MVP, not a multi-tenant SaaS.
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
```

```bash
npm run dev
```

Open http://localhost:3000.

The key is **server-only**. It is never exposed through `NEXT_PUBLIC_*`, never printed in logs, and
never returned by an API route.

### Verify the integration

1. Open **Settings** — the Sarvam connection card should read “API key detected”.
2. Create a 2-minute episode on any topic and generate the script.
3. Edit one turn, rewrite another with AI, then generate audio.
4. Listen in the bottom player and download the WAV.
5. Refresh and reopen the episode from **My Episodes**.
6. Optionally upload background music before rendering and confirm it is mixed.

If credits are exhausted or the key is invalid, every action surfaces a clear error toast; nothing
is simulated.

---

## Architecture

```text
app/
  page.tsx                      # Create workspace + episode workspace
  episodes/page.tsx             # IndexedDB episode library
  voices/page.tsx               # Official voice catalogue + live previews
  settings/page.tsx             # Environment status + deployment notes
  api/
    generate-script/route.ts    # Sarvam-105B → validated structured script
    generate-audio/route.ts     # Bulbul TTS, chunked to the 2,500-char limit
    regenerate-segment/route.ts # Single-turn AI rewrite
    translate/route.ts          # Mayura translation, chunked
    health/route.ts             # Server env status (no secrets)
components/
  studio-provider.tsx           # Global studio state, playback, persistence
  studio/                       # Create, script editor, audio panel, episode view
  shell/                        # Sidebar, persistent player, toast
  ui.tsx                        # shadcn-style primitives
  voice-preview-button.tsx      # Real TTS previews
lib/
  sarvam.ts                     # Server-only client: auth, timeouts, retries, TTS splitting
  script-generator.ts           # Prompt engineering + validation/repair
  audio-processor.ts            # Decode, concatenate, music mix, WAV export
  audio-export.ts               # 16-bit PCM WAV encoder
  document-parser.ts            # PDF.js / Mammoth / TXT extraction
  db.ts                         # IndexedDB metadata + audio stores
  voices.ts                     # Official curated voice registry
  validators.ts                 # Zod schemas
types/podcast.ts
```

### Server guarantees

- API key validation and safe error messages (no raw upstream payloads or keys leak).
- Request timeouts plus bounded retries on 429/5xx/network failures.
- Per-instance rate limiting on script, TTS, rewrite, and translation routes.
- Input validation with Zod, file-size limits (10 MB) and text limits (60,000 chars).
- TTS text is split on sentence boundaries below the documented 2,500-character REST limit.
- Dialogue is sent to Bulbul one turn at a time; no entire-episode request.

### Design system

Neutral dark studio palette, controlled purple accent, restrained gradients, editorial serif
display type, Inter for UI, Lucide icons, and functional-only decoration. The persistent player,
segment progress and waveform motifs are part of the production workflow, not ornament.

---

## Build & quality checks

```bash
npm run typecheck
npm run build
npm start
```

`npm run build` must pass before deploying. The app is Vercel-ready: all AI calls happen in Node
route handlers, storage is client-side IndexedDB, and no long-running process is required.

---

## Deploy to Vercel

1. Push the repository to GitHub with this app at the repo root on `main`.
2. Import the repository at https://vercel.com/new.
3. Add `SARVAM_API_KEY` (and optionally the model overrides) under **Settings → Environment
   Variables** for Production and Preview.
4. Deploy.
5. Open the production URL and run the verification checklist above.

Do not commit `.env.local`. It is already ignored; `.env.example` documents the required keys.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn-style primitives |
| Icons | Lucide |
| Script AI | Sarvam-105B |
| Voice AI | Sarvam Bulbul v4 Flash (v3 for Malayalam) |
| Translation | Sarvam Mayura v1 |
| Documents | PDF.js + Mammoth |
| Audio | Web Audio API + custom WAV encoder |
| Storage | IndexedDB |
| Deployment | Vercel |

---

Built for the MicDrop AI studio. Every generate button is wired to a real API call.
