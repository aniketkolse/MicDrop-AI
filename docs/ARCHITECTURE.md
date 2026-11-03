# MicDrop AI — Architecture

## Overview

MicDrop AI is a Next.js 15 App Router application that converts topics, prompts, or documents into AI-generated podcasts using Sarvam AI APIs.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Studio    │  │   Editor    │  │   Audio Player      │ │
│  │   (Create)  │  │   (Edit)    │  │   (Playback)        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│           │                  │                  │           │
│           └──────────────────┼──────────────────┘           │
│                              │                                │
│                    ┌─────────▼─────────┐                      │
│                    │  StudioProvider   │                      │
│  ┌────────────────┤  (Global State)   ├────────────────┐     │
│  │  ErrorBoundary │  └─────────────────┘                │     │
│  │   (Crash       │                                       │     │
│  │   Protection)  │                                       │     │
│  └────────────────┘                                       │     │
│                              │                                │
└──────────────────────────────┼────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Next.js 15       │
                    │   App Router        │
                    │                     │
              ┌─────┴──────┬──────┴──────┴─────┐
              │            │            │       │
         ┌────▼────┐  ┌────▼────┐  ┌───▼──────┐
         │  API    │  │  API    │  │   API    │
         │generate-│  │generate-│  │ podcasts │
         │ -script │  │ -audio  │  │  (CRUD)  │
         └────┬────┘  └────┬────┘  └────┬─────┘
              │            │            │
              └────────────┴────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Sarvam AI API    │
                    │  (105B, Bulbul,     │
                    │   Mayura)           │
                    └─────────────────────┘

                    ┌──────────▼──────────┐
                    │   Supabase          │
                    │  (PostgreSQL,       │
                    │   Auth, Storage)    │
                    └─────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 App Router | Server-side rendering, API routes |
| Language | TypeScript (strict) | Type safety |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | Custom (shadcn-style) | Reusable primitives |
| Icons | Lucide React | Icon library |
| Script AI | Sarvam-105B | Podcast script generation |
| Voice AI | Sarvam Bulbul v4 Flash | Text-to-speech |
| Translation | Sarvam Mayura v1 | Script translation |
| Documents | PDF.js, Mammoth | PDF/DOCX/TXT parsing |
| Audio | Web Audio API | Audio assembly, mixing, WAV export |
| Storage | IndexedDB (local) | Offline episode storage |
| Database | Supabase (PostgreSQL) | Cloud persistence (authenticated) |
| Auth | Supabase Auth | User authentication |
| File Storage | Supabase Storage | Private audio/document storage |
| Deployment | Vercel | Serverless hosting |

## Data Flow

### Script Generation
1. User enters topic/prompt/document in Create workspace
2. Client sends request to `/api/generate-script`
3. Server calls Sarvam-105B via `/v2/chat/completions` (V1 fallback)
4. Response is validated with Zod schema
5. Script is saved to IndexedDB and (if authenticated) Supabase

### Audio Generation
1. User clicks "Generate audio" in Audio panel
2. Client iterates through script segments
3. For each segment, client calls `/api/generate-audio` with Bulbul TTS
4. Audio chunks are decoded with Web Audio API
5. Segments are concatenated with natural gaps
6. Optional background music is mixed with fade-in/fade-out
7. Soft limiter prevents clipping
8. Final audio is encoded as 16-bit PCM WAV
9. Audio is saved to IndexedDB and (if authenticated) Supabase Storage

### Authentication Flow
1. User signs up/in via `/auth` page
2. Server calls Supabase Auth
3. On success, `setAuthState` updates studio context
4. Subsequent API calls include authenticated user context
5. RLS policies ensure users only access their own data

## Security

- API keys are server-only (never exposed via `NEXT_PUBLIC_*`)
- RLS policies on all database tables
- Storage buckets are private with ownership-based access
- API routes validate user identity from session
- No secrets in client-side code or logs

## Performance

- Bundle size: ~102KB shared + ~50KB per page
- Audio segments are cached to avoid re-rendering
- Soft limiter prevents clipping in audio output
- Music fade-in prevents abrupt starts
- Request ID tracing for Sarvam API debugging