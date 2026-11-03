# MicDrop AI — API Reference

## Base URL

All API routes are relative to the Next.js application root.

## Authentication

API routes that modify data require authentication. The authenticated user is derived from the Supabase session cookie, not from client-supplied parameters.

## API Routes

### Script Generation

**POST** `/api/generate-script`

Generates a podcast script using Sarvam-105B.

**Request Body:**
```json
{
  "sourceType": "topic" | "prompt" | "document" | "text",
  "topic": "string (max 500 chars)",
  "sourceText": "string (max 60000 chars)",
  "duration": 2 | 5 | 10 | 15,
  "language": "en-IN" | "hi-IN" | "mr-IN" | "ta-IN" | "te-IN" | "bn-IN" | "gu-IN" | "kn-IN" | "ml-IN" | "pa-IN",
  "speakerCount": 1 | 2 | 3,
  "style": "educational" | "casual" | "interview" | "debate" | "news" | "storytelling",
  "audience": "string (max 60 chars)",
  "depth": "overview" | "standard" | "deep",
  "voiceIds": ["string"] (optional)
}
```

**Response:**
```json
{
  "script": {
    "title": "string",
    "description": "string",
    "duration": number,
    "language": "string",
    "speakers": [
      { "id": "string", "name": "string", "role": "string", "voiceId": "string" }
    ],
    "segments": [
      { "id": "string", "heading": "string", "speaker": "string", "text": "string" }
    ],
    "researchNote": "string"
  }
}
```

### Voice Generation (TTS)

**POST** `/api/generate-audio`

Generates speech audio using Sarvam Bulbul.

**Request Body:**
```json
{
  "text": "string (max 8000 chars)",
  "language": "en-IN" | "hi-IN" | ...,
  "voiceId": "string (official Bulbul voice ID)",
  "pace": 0.5 | 1.0 | 1.5 (optional, default 1)
}
```

**Response:**
```json
{
  "audios": ["base64_string", ...],
  "model": "bulbul:v4-flash",
  "chunks": number
}
```

### Single Segment Rewrite

**POST** `/api/regenerate-segment`

Rewrites a single dialogue segment using Sarvam-105B.

**Request Body:**
```json
{
  "script": { ... full script object ... },
  "segmentId": "string",
  "style": "string (optional)",
  "audience": "string (optional)",
  "depth": "string (optional)"
}
```

**Response:**
```json
{
  "segment": {
    "heading": "string",
    "text": "string",
    "speaker": "string"
  }
}
```

### Translation

**POST** `/api/translate`

Translates script segments using Sarvam Mayura.

**Request Body:**
```json
{
  "segments": [
    { "id": "string", "text": "string" }
  ],
  "sourceLanguage": "en-IN",
  "targetLanguage": "hi-IN"
}
```

**Response:**
```json
{
  "segments": [
    { "id": "string", "text": "string" }
  ],
  "targetLanguage": "hi-IN"
}
```

### Health Check

**GET** `/api/health`

Returns Sarvam and Supabase configuration status (no secrets exposed).

**Response:**
```json
{
  "configured": true,
  "chatModel": "sarvam-105b",
  "ttsModel": "bulbul:v4-flash",
  "baseUrl": "https://api.sarvam.ai",
  "checkedAt": "ISO timestamp"
}
```

### Podcast CRUD

**GET** `/api/podcasts`

Lists user's podcasts with speakers and segments.

**Response:**
```json
{
  "podcasts": [ { ... full podcast object ... } ]
}
```

**POST** `/api/podcasts`

Creates a new podcast record.

**Request Body:**
```json
{
  "title": "string",
  "description": "string (optional)",
  "language": "string",
  "status": "string (optional)",
  "script": "object (optional)",
  "original_prompt": "string (optional)",
  "source_type": "string (optional)",
  "source_document_path": "string (optional)"
}
```

**GET** `/api/podcasts/[id]`

Gets a single podcast with speakers and segments.

**PATCH** `/api/podcasts/[id]`

Updates a podcast record.

**DELETE** `/api/podcasts/[id]`

Deletes a podcast record.

### Speaker CRUD

**GET** `/api/podcasts/[id]/speakers`

Lists speakers for a podcast.

**POST** `/api/podcasts/[id]/speakers`

Creates a speaker.

**PATCH** `/api/podcasts/[id]/speakers/[speakerId]`

Updates a speaker.

**DELETE** `/api/podcasts/[id]/speakers/[speakerId]`

Deletes a speaker.

### Segment CRUD

**GET** `/api/podcasts/[id]/segments`

Lists segments for a podcast.

**POST** `/api/podcasts/[id]/segments`

Creates a segment.

**PATCH** `/api/podcasts/[id]/segments/[segmentId]`

Updates a segment.

**DELETE** `/api/podcasts/[id]/segments/[segmentId]`

Deletes a segment.

### Audio

**POST** `/api/podcasts/[id]/audio`

Uploads final WAV audio and updates podcast record.

**Request:** multipart/form-data with `file` field

**Response:**
```json
{
  "audioPath": "string",
  "signedUrl": "string"
}
```

**GET** `/api/podcasts/[id]/audio`

Gets a signed URL for downloading podcast audio.

**Response:**
```json
{
  "signedUrl": "string",
  "audioPath": "string"
}
```

### Auth Session

**GET** `/api/auth/session`

Returns the current authenticated user (if any).

**Response:**
```json
{
  "user": { "id": "string", "email": "string" } | null,
  "authenticated": boolean
}
```

## Error Responses

All API errors return a consistent JSON structure:

```json
{
  "error": "human readable error message",
  "code": "error_code (optional)"
}
```

HTTP status codes:
- 200: Success
- 400: Invalid request
- 401: Not authenticated
- 403: Forbidden
- 404: Not found
- 429: Rate limited
- 500: Internal server error
- 502: Upstream error (Sarvam)
- 503: Service unavailable (missing configuration)
- 504: Timeout

## Rate Limiting

API routes use in-memory rate limiting:
- Script generation: 12 requests per minute per IP
- Audio generation: 60 requests per minute per IP
- Translation: 20 requests per minute per IP
- Segment rewrite: 30 requests per minute per IP

Note: Rate limits are per server instance, not global.