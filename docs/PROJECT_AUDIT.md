# MicDrop AI — Project Audit Report

**Date:** 2026-11-03  
**Repository:** https://github.com/aniketkolse/MicDrop-AI  
**Branch:** main (commit 6f7ddfd)  
**Status:** Pre-audit baseline recorded

---

## Executive Summary

MicDrop AI is a Next.js 15 App Router application that converts topics, prompts, or documents into AI-generated podcasts using Sarvam AI (Sarvam-105B for scripts, Bulbul v4 Flash for TTS, Mayura for translation). The project has a working frontend with a luxury Apple-inspired UI, a real Sarvam AI integration pipeline, IndexedDB local storage, and partial Supabase backend integration.

**Overall condition:** The application compiles and runs in development, but the production build fails. TypeScript is clean, all 40 unit tests pass, but the middleware configuration prevents `next build` from completing. Supabase integration is partially implemented but not fully connected to the studio workflow. Authentication exists but is not wired into the studio provider state. IndexedDB remains the sole persistence layer for episodes.

---

## Baseline Test Results

| Check | Result | Details |
|-------|--------|---------|
| `tsc --noEmit` | ✅ PASS | 0 TypeScript errors (after `.next` cache clean) |
| `vitest run` | ✅ PASS | 40/40 tests across 6 test files |
| `next build` | ❌ FAIL | `Cannot find module '.next/server/middleware-manifest.json'` |
| `npm run dev` | ✅ PASS | Dev server starts on port 3000/3004 |

---

## Repository Structure

```
Y:\MicDrop AI\
├── app/
│   ├── layout.tsx                          # Root layout with StudioProvider
├── page.tsx                                # Home/create workspace
│   ├── auth/
│   │   ├── page.tsx                        # Login/signup form
│   │   ├── login/page.tsx                  # Redirect to /auth
│   │   ├── signup/page.tsx                 # Redirect to /auth
│   │   └── callback/route.ts               # Supabase auth callback
│   │   └── session/route.ts                # Session check API
│   ├── dashboard/
│   │   ├── page.tsx                        # Podcast library
│   │   ├── create/page.tsx                 # Create podcast form
│   │   └── podcasts/[id]/
│   │       ├── page.tsx                    # Episode detail studio
│   │       └── edit/page.tsx               # Script editor
│   ├── api/
│   │   ├── generate-script/route.ts        # Sarvam-105B script generation
│   │   ├── generate-audio/route.ts         # Bulbul TTS per segment
│   │   ├── regenerate-segment/route.ts     # Single-turn AI rewrite
│   │   ├── translate/route.ts              # Mayura translation
│   │   ├── health/route.ts                 # Sarvam health check
│   │   ├── podcasts/route.ts               # Podcast CRUD (Supabase)
│   │   ├── podcasts/[id]/route.ts          # Single podcast CRUD
│   │   ├── podcasts/[id]/speakers/route.ts # Speaker CRUD
│   │   ├── podcasts/[id]/speakers/[speakerId]/route.ts
│   │   ├── podcasts/[id]/segments/route.ts # Segment CRUD
│   │   ├── podcasts/[id]/segments/[segmentId]/route.ts
│   │   └── podcasts/[id]/audio/route.ts    # WAV upload + signed URL
│   ├── episodes/page.tsx                   # Episode library (dual-mode)
│   ├── settings/page.tsx                   # Settings + auth status
│   └── voices/page.tsx                     # Voice catalogue + previews
├── components/
│   ├── studio-provider.tsx                 # Global studio state + Supabase sync
│   ├── studio/
│   │   ├── create-workspace.tsx            # Topic/prompt/document input
│   │   ├── script-editor.tsx               # Inline segment editor
│   │   ├── audio-panel.tsx                 # Voice casting + generation
│   │   └── episode-workspace.tsx           # Episode title + translate
│   ├── shell/
│   │   ├── sidebar.tsx                     # Navigation + auth status
│   │   ├── audio-player.tsx                # Persistent bottom player
│   │   └── toast.tsx                       # Notification toast
│   ├── ui.tsx                              # Shadcn-style primitives
│   └── voice-preview-button.tsx          # Live Bulbul voice previews
├── lib/
│   ├── sarvam.ts                           # Server-only Sarvam client
│   ├── script-generator.ts                 # Prompt engineering + validation
│   ├── audio-processor.ts                  # Web Audio assembly + WAV export
│   ├── audio-export.ts                     # 16-bit PCM WAV encoder
│   ├── document-parser.ts                  # PDF/DOCX/TXT extraction
│   ├── db.ts                               # IndexedDB metadata + audio stores
│   ├── voices.ts                           # Official Bulbul v4 Flash catalogue
│   ├── validators.ts                       # Zod schemas
│   ├── rate-limit.ts                       # In-memory rate limiter
│   ├── utils.ts                            # Format helpers, nanoid
│   ├── storage-path.ts                     # Supabase storage path helper
│   └── services/
│       ├── auth.ts                         # Supabase auth service
│       ├── podcasts.ts                     # Supabase podcast CRUD
│       └── storage.ts                      # Supabase storage service
├── lib/supabase/
│   ├── client.ts                           # Browser Supabase client
│   ├── server.ts                           # Server Supabase client
│   └── middleware.ts                       # Next.js middleware
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql          # Core schema + RLS
│       └── 002_storage_buckets.sql         # Storage buckets + RLS
├── types/
│   ├── podcast.ts                          # Domain types
│   └── supabase.ts                         # Supabase DB types
├── tests/
│   ├── utils.test.ts                       # nanoid, formatTime, cn
│   ├── validators.test.ts                  # Zod schema validation
│   ├── audio-export.test.ts                # WAV encoder
│   ├── storage-path.test.ts                # Storage path generation
│   ├── podcasts-service.test.ts            # Supabase service (mocked)
│   └── sarvam.test.ts                      # Sarvam fetch mock
├── docs/                                   # Documentation (new)
├── middleware.ts                           # Next.js middleware entry
├── vitest.config.ts                        # Vitest configuration
├── playwright.config.js                    # E2E test configuration
├── package.json                            # Dependencies
├── next.config.ts                          # Next.js configuration
├── tailwind.config.ts                      # Tailwind design tokens
├── tsconfig.json                           # TypeScript configuration
├── postcss.config.mjs                      # PostCSS configuration
├── .env.example                            # Environment variable template
├── .env.local                              # Local secrets (gitignored)
├── .gitignore                              # Git ignore rules
├── package-lock.json                       # Lockfile
└── README.md                               # Project documentation
```

---

## Phase A — Audit Findings

### P0 — Critical Issues

| ID | Issue | Location | Severity | Description |
|----|-------|----------|----------|-------------|
| P0-1 | Production build fails | `middleware.ts`, `lib/supabase/middleware.ts` | Critical | `next build` fails with `middleware-manifest.json` not found. The middleware configuration prevents production deployment. |
| P0-2 | Supabase client import mismatch | `lib/supabase/middleware.ts` | Critical | Middleware imports `createServerClient` from `@supabase/ssr` directly instead of using the `./server` wrapper with `isConfigured` guard. This can cause runtime errors when Supabase is unconfigured. |
| P0-3 | Studio provider not connected to auth | `components/studio-provider.tsx` | Critical | `setAuthState` exists in context but is never called by any auth page. Login/signup does not update studio auth state, so authenticated users cannot access Supabase-persisted episodes. |
| P0-4 | IndexedDB is sole persistence | `lib/db.ts`, `components/studio-provider.tsx` | Critical | Episodes are stored only in IndexedDB. Supabase tables exist but studio provider's `persist()` only writes locally. No cloud sync, no cross-device access. |
| P0-5 | `.env.local` committed to git | `.env.local` | Critical | The `.env.local` file contains a real Sarvam API key and was found in the working tree. It is gitignored but must be verified as not committed. |

### P1 — Major Issues

| ID | Issue | Location | Severity | Description |
|----|-------|----------|----------|-------------|
| P1-1 | `handle_new_user()` trigger before function | `supabase/migrations/001_initial_schema.sql` | Major | Migration creates trigger referencing `handle_new_user()` before the function is defined (lines 133-139 before 142-150). Fixed in audit but needs corrective migration. |
| P1-2 | `CREATE POLICY IF NOT EXISTS` invalid SQL | `supabase/migrations/001_initial_schema.sql` | Major | PostgreSQL does not support `CREATE POLICY IF NOT EXISTS`. Migration will fail on apply. |
| P0-3 | No authenticated user sync | `components/studio-provider.tsx` | Major | `createScript()` calls Supabase API but `setAuthState` is never called from login/signup pages. |
| P0-4 | Audio player not wired to Supabase | `components/shell/audio-player.tsx` | Major | Player uses IndexedDB blob URLs only. No signed URL playback from Supabase Storage. |
| P0-5 | No generation job persistence | `components/studio-provider.tsx` | Major | `generateAudio()` runs client-side but does not create/update Supabase `generation_jobs` records. No job recovery after refresh. |

### P2 — Performance & Maintainability

| ID | Issue | Location | Severity | Description |
|----|-------|----------|----------|-------------|
| P2-1 | Large provider file | `components/studio-provider.tsx` (~750 lines) | Moderate | Studio provider mixes auth state, Supabase sync, audio generation, IndexedDB persistence, and playback controls. Should be split into focused services. |
| P2-2 | In-memory rate limiter | `lib/rate-limit.ts` | Moderate | Rate limiting is per-serverless-instance, not global. Not suitable for production multi-instance deployment. |
| P2-3 | No E2E test for full journey | `tests/e2e/` | Moderate | E2E tests exist but only test page loading, not the full create→script→audio→player→library journey. |
| P2-4 | Document parser file-type detection | `lib/document-parser.ts` | Moderate | Relies on file extension; should also validate MIME type and file content. |
| P2-5 | No request ID tracking | `lib/sarvam.ts` | Moderate | No request ID propagation for tracing Sarvam API calls across retries and failures. |

### P3 — Quality Improvements

| ID | Issue | Location | Severity | Description |
|----|-------|----------|----------|-------------|
| P3-1 | Missing API documentation | `docs/` | Minor | No API documentation for route handlers. |
| P3-2 | No deployment documentation | `docs/DEPLOYMENT.md` | Minor | Deployment steps exist in README but lack Supabase-specific steps. |
| P3-3 | No SECURITY.md | `docs/SECURITY.md` | Minor | No security policy documentation. |
| P3-4 | Environment variable validation | `.env.example` | Minor | Missing documentation for which vars are required vs optional. |

---

## Phase A — Baseline Summary

- **TypeScript:** Clean (0 errors)
- **Unit Tests:** 40/40 passing
- **Production Build:** Fails (middleware manifest)
- **Dev Server:** Works
- **Git Status:** 21 modified files, uncommitted

---

## Implementation Plan

The following stages will be executed in order:

1. **Stage B — Critical correctness and security** (fix build, auth sync, RLS, API keys)
2. **Stage C — Backend persistence** (connect Supabase to studio workflows)
3. **Stage D — AI and generation reliability** (improve Sarvam integration, retry, recovery)
4. **Stage E — Audio engine** (improve validation, assembly, mixing, WAV export)
5. **Stage E — Audio engine** (improve validation, assembly, mixing, WAV export)
6. **Stage F — Frontend and user experience** (state management, loading/error states)
7. **Stage G — Performance and reliability** (bundle, queries, logging)
8. **Stage H — Testing and deployment** (expand tests, E2E, build, Vercel config)

Documentation will be updated throughout.

---
