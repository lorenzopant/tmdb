# Testing

Runner: **Vitest** (`globals: true`, node environment). Config:
[packages/tmdb/vitest.config.mts](../../packages/tmdb/vitest.config.mts).

## Two test kinds

| Kind | File suffix | Hits real API? | Token needed |
|------|-------------|----------------|--------------|
| **Unit** | `*.test.ts` (not `.integration`) | No — `fetch` or `client.request` is mocked | No |
| **Integration** | `*.integration.test.ts` | Yes — real TMDB calls | Yes (`TMDB_BEARER_TOKEN`) |

At time of writing: ~47 unit files, ~24 integration files. Tests live under
`packages/tmdb/src/tests/`, mirroring the namespace structure.

The split is enforced by the scripts:
- `test:unit` → `vitest run --exclude '**/*.integration.test.ts'`
- `test:integration` → `vitest run integration`

## Commands

From repo root (Turborepo) or with `pnpm --filter @lorenzopant/tmdb`:

| Command | What it does |
|---------|--------------|
| `pnpm test` / `pnpm test:unit` | Run unit tests (no network, no token). |
| `pnpm test:integration` | Run integration tests (requires token). |
| `pnpm test:coverage` | Coverage (v8 reporter). |
| `pnpm test:watch` | Vitest watch mode (library only). |
| `pnpm test:ui` | Vitest UI (library only). |

Integration tests load env via `dotenv/config` (vitest `setupFiles`). Provide
`TMDB_BEARER_TOKEN` (and `TMDB_API_KEY` where used) in `.env` or the environment. The CI
integration job and the pre-push hook **skip** integration tests when no token is present.

## Unit test patterns

Two mocking styles appear in the codebase — match the one used by sibling tests.

### 1. Mock the client (namespace/endpoint tests)
Assert that a namespace method calls `client.request`/`mutate` with the exact endpoint and
params. Example shape (from the trending tests):

```ts
beforeEach(() => {
    clientMock = new ApiClient("valid_access_token");
    clientMock.request = vi.fn();
    trendingAPI = new TrendingAPI(clientMock);
});

it("calls the correct endpoint", async () => {
    await trendingAPI.all({ time_window: "day" });
    expect(clientMock.request).toHaveBeenCalledWith("/trending/all/day", { language: undefined });
});
```

> These tests assert the **exact** args object. That is why the params object *shape*
> matters (an extra `page: undefined` key would break them) — see [CONCERNS.md](CONCERNS.md).

### 2. Mock `fetch` (client/transport tests)
`tests/client/` exercises `ApiClient` behaviour directly by replacing `globalThis.fetch`.
There is one file per capability:
`client.auth`, `client.cache`, `client.deduplication`, `client.interceptors`,
`client.response-interceptors`, `client.rate-limit`, `client.retry`, `client.logger`.

These often use `vi.useFakeTimers()` (for TTL/backoff), a hardcoded mock JWT (fetch is fully
mocked so a real token isn't needed), and a `makeResponse()` helper returning a fake
`Response`-like object. Restore globals in `afterEach`.

## Integration test patterns
- Construct a real `new TMDB(process.env.TMDB_BEARER_TOKEN!)` once per file.
- Assert against **stable** real data (e.g. movie 550 = *Fight Club*).
- For error paths, assert `instanceof TMDBError` rather than an exact message (TMDB error
  responses for the same input are not always identical).
- Cover `append_to_response` combinations on detail endpoints.

## Coverage
- Reporters: `text`, `json`, `html`, `clover`.
- Excluded from coverage: `src/types/**`, `dist/**`, `vitest.config.mts`, `src/index.ts`.

## When adding tests
Always add **both** a unit test (mock the client) and an integration test (real call) for a
new endpoint, mirroring the existing folder for that namespace. Keep unit tests
network-free and deterministic.
