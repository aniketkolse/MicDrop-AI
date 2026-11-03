# MicDrop AI — Testing

## Test Stack

| Tool | Purpose |
|------|---------|
| Vitest | Unit and integration tests |
| jsdom | DOM environment for tests |
| @testing-library/react | React component testing |
| @testing-library/jest-dom | DOM assertions |
| Playwright | End-to-end tests |

## Test Files

| File | Tests | Description |
|------|-------|-------------|
| `tests/utils.test.ts` | 6 | nanoid, formatTime, cn utilities |
| `tests/validators.test.ts` | 8 | Zod schema validation, safeJsonParse |
| `tests/audio-export.test.ts` | 3 | WAV encoder (mono, stereo, sine wave) |
| `tests/storage-path.test.ts` | 3 | Storage path generation, bucket constants |
| `tests/podcasts-service.test.ts` | 13 | Supabase service (mocked client) |
| `tests/sarvam.test.ts` | 1 | Sarvam fetch mock |
| `tests/e2e/micdrop.spec.ts` | 5 | E2E: homepage, auth, voices, settings, create |

## Running Tests

```bash
# Unit tests
npx vitest run

# E2E tests (requires dev server)
npx playwright test
```

## Coverage

Current test coverage:
- ✅ Utility functions
- ✅ Input validation (Zod schemas)
- ✅ Audio encoding (WAV)
- ✅ Storage path generation
- ✅ Supabase service layer (mocked)
- ✅ Sarvam client (mocked)
- ✅ E2E page loading
- ⚠️ Component rendering (not covered)
- ⚠️ API routes (not covered)
- ⚠️ RLS policies (not covered - requires live Supabase)
- ⚠️ Authentication flow (not covered - requires live Supabase)

## Writing Tests

Unit tests use Vitest with jsdom environment. Mock external services where appropriate:

```typescript
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(() => mockSupabase),
}));

describe("My service", () => {
  it("does something", async () => {
    // Arrange
    mockSupabase.from.mockReturnValue({ ... });
    
    // Act
    const result = await myService();
    
    // Assert
    expect(result).toEqual(expected);
  });
});
```

## E2E Tests

E2E tests use Playwright and cover the critical user journey:

1. Homepage loads
2. Auth page shows login form
3. Voices page shows catalogue
4. Settings page shows configuration
5. Create page shows form

Run E2E tests:
```bash
npm run dev &  # Start dev server
npx playwright test
```

## Test Results

Baseline results (as of last run):

| Suite | Tests | Passed | Failed | Skipped |
|-------|-------|--------|--------|---------|
| utils | 6 | 6 | 0 | 0 |
| validators | 8 | 8 | 0 | 0 |
| audio-export | 3 | 3 | 0 | 0 |
| storage-path | 3 | 3 | 0 | 0 |
| podcasts-service | 13 | 13 | 0 | 0 |
| sarvam | 1 | 1 | 0 | 0 |
| E2E | 5 | 5 | 0 | 0 |
| **Total** | **40** | **40** | **0** | **0** |