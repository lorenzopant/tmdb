# Architecture

How the library is designed at runtime. The docs app is a conventional Next.js App Router
site and is covered briefly at the end; the interesting design is in the library.

## Mental model

The library is a **facade over the TMDB REST API**. Three layers:

```
   User code
       │  tmdb.movies.details({ movie_id: 550 })
       ▼
┌──────────────────────────┐
│  Namespace API classes    │   endpoints/*.ts  (MoviesAPI, SearchAPI, …)
│  - shape params           │   all extend TMDBAPIBase
│  - pick the route         │
└──────────┬───────────────┘
           │  this.client.request(endpoint, params)
           ▼
┌──────────────────────────┐
│  ApiClient                │   client.ts  (the only fetch() caller)
│  - interceptors           │
│  - dedup + cache          │
│  - rate limit + retry     │
│  - null sanitisation      │
│  - image URL transform    │
└──────────┬───────────────┘
           │  fetch()
           ▼
     TMDB REST API (v3 or v4)
```

## Key components

### `TMDB` — the facade ([src/tmdb.ts](../../packages/tmdb/src/tmdb.ts))
- Constructed with an access token (API key **or** JWT bearer) and optional `TMDBOptions`.
- Creates **one** shared `ApiClient` and instantiates every namespace API class with it
  (`this.movies = new MoviesAPI(this.client, this.options)`, etc.).
- Exposes ~28 namespaces as public properties (`movies`, `tv_series`, `search`, `discover`, `account`, …).
- `get v4()` — lazily builds a `TMDBv4` sub-client. **Throws** if the token is not a JWT
  (v4 requires bearer auth). Guarded by `isJwt()`.
- `get cache()` — returns cache controls (`clear`, `invalidate`, `size`) only when the
  `cache` option was enabled; otherwise `undefined`.
- `images` is special: it is an `ImageAPI` (URL builder), not an HTTP namespace.

### `TMDBv4` — v4 sub-facade ([src/tmdb.v4.ts](../../packages/tmdb/src/tmdb.v4.ts))
- Aggregates `auth`, `account`, `lists` (the v4 surface).
- Builds its **own** `ApiClient` with `version: 4` → base URL `https://api.themoviedb.org/4`.
- Reached via `tmdb.v4.*`. Requires a JWT.

### `TMDBAPIBase` — abstract base for every namespace ([src/endpoints/base.ts](../../packages/tmdb/src/endpoints/base.ts))
All namespace classes extend this. It provides:
- `protected client` and `protected defaultOptions`.
- A flexible constructor: accepts **either** an access token string (creates a client) or an
  existing `ApiClient` (shares it). The `TMDB` facade always passes the shared client.
- Helper methods for merging defaults into params:
  - `applyDefaults(params)` — injects `language`/`region` defaults (request-safe options only).
  - `withLanguage(params)` — ensures a `language` is present (explicit > default > omit).
  - `injectImageLanguage(params)` — derives `include_image_language` from configured
    `image_language_priority` when `auto_include_image_language` is on.

### `ApiClient` — the HTTP engine ([src/client.ts](../../packages/tmdb/src/client.ts))
The single most important file. Two public entry points:

- **`request<T>(endpoint, params)`** — for `GET`. Goes through the full pipeline:
  interceptors → cache check → deduplication → `execute()`.
- **`mutate<T>(method, endpoint, body?, params?)`** — for `POST`/`PUT`/`DELETE` (and the rare
  side-effectful `GET`). **Never** deduplicated or cached (mutations change server state).

`execute()` is the shared fetch pipeline used by both:
1. Run request interceptors (unless already applied by `request()`).
2. Build the URL from `baseUrl + endpoint`, append serialised params.
3. Append auth: `Authorization: Bearer <token>` for JWTs, else `?api_key=<token>`.
4. `fetch` — wrapped by the retry manager if retry is enabled.
5. On non-2xx: `normalizeError()` → throws a `TMDBError`; notifies the `onError` interceptor.
6. On success: parse JSON → `sanitizeNulls()` → optional image transform → `onSuccess` interceptor.

### Cross-cutting capabilities (all in `ApiClient`, opt-in via `TMDBOptions`)
| Capability | Default | Mechanism |
|-----------|---------|-----------|
| **Deduplication** | on | `inflightRequests` map keyed by `buildRequestKey()`. Concurrent identical GETs share one promise; evicted on settle. |
| **Caching** | off | `ResponseCache` (TTL, optional max size). Keyed identically to dedup. Checked before dedup/network. GET only. |
| **Rate limiting** | off | `RateLimiter` — FIFO queue, slot acquired immediately before `fetch`. |
| **Retry** | off | `RetryManager` — exponential backoff. Retries 5xx + network errors by default, never 4xx. Boundary wraps only fetch + status check (so JSON/interceptor errors don't re-fetch). |
| **Interceptors** | none | `request` (may rewrite endpoint/params), `response.onSuccess` (may transform data), `response.onError` (side-effect only; error always re-thrown). |
| **Logging** | off | `TMDBLogger` — `true` for console, or a custom function. |
| **Image transform** | off | `ImageAPI.autocompleteImagePaths` / `applyFallbacksOnly` applied to responses. |

### Request key determinism
`buildRequestKey()` + `serializeParams()` produce a stable, order-independent key:
`undefined` params are dropped, remaining entries sorted alphabetically. This means dedup
and cache treat `{language, page}` and `{page, language}` as identical, and never key on
values that won't be sent. **Implication:** the *shape* of the params object passed to
`request()` matters for callers/interceptors/tests even though `undefined` is stripped for
the URL (see [CONCERNS.md](CONCERNS.md)).

### Null handling
TMDB returns many fields as `null`. `sanitizeNulls()` recursively converts `null → undefined`
so optional TS properties model nullable fields. **Convention:** types still annotate API
nullables as `field: T | null`, but at runtime you receive `undefined`. Keep this in mind
when reading response types vs runtime values.

### `ImageAPI` ([src/images/images.ts](../../packages/tmdb/src/images/images.ts))
Not an HTTP client — a **URL builder** and response transformer. Builds full image URLs
(`backdrop()`, `poster()`, `logo()`, `profile()`, `still()`) from TMDB image paths + size,
and can walk a response to autocomplete `*_path` fields or apply fallbacks.

### Errors ([src/errors/](../../packages/tmdb/src/errors/))
- `TMDBError` extends `Error` with `http_status_code`, `tmdb_status_code` (`-1` = library
  error, not from the API), and `message`.
- `Errors` ([messages.ts]) — centralised error-message constants.

### Utilities ([src/utils/](../../packages/tmdb/src/utils/))
| File | Provides |
|------|----------|
| `pagination.ts` | `paginate()` (async generator), `fetchAllPages()` (with optional `deduplicateBy`), `hasNextPage`/`hasPreviousPage`, `getPageInfo`. TMDB caps pages at 500. |
| `cache.ts` | `ResponseCache`, `CacheOptions`. |
| `rate-limiter.ts` | `RateLimiter`, `RateLimitOptions`. |
| `retry.ts` | `RetryManager`, `RetryOptions`. |
| `jwt.ts` | `isJwt()` — distinguishes bearer JWT from API key. |
| `logger.ts` | `TMDBLogger`, `TMDBLoggerFn`, `TMDBLoggerEntry`. |
| `types.ts` | Runtime type guards (`isRecord`, `isPlainObject`, `hasPosterPath`, …). |

## Type system architecture
The type layer is as much "product" as the runtime. See [CONVENTIONS.md](CONVENTIONS.md) for
the composition patterns. Highlights:
- Utility types `Prettify<T>` and `LiteralUnion<T>` ([types/utility.ts]).
- Param composition via `WithParams<K>` / `WithLanguage` / `WithLanguagePage` / `DateRange`
  ([types/common/params.ts]).
- **`append_to_response` generics** — e.g. `MovieDetailsWithAppends<T>` conditionally widens
  the return type based on the literal array of appended namespaces passed at the call site.
  This is the library's signature type-safety feature.

## Docs app architecture (brief)
- Next.js App Router. Content is MDX under `content/docs/`, loaded via Fumadocs `loader()`
  in [apps/docs/lib/source.ts](../../apps/docs/lib/source.ts).
- Route handlers expose machine-readable docs: `/llms.txt`, `/llms-full.txt`,
  `/llms.mdx/docs/[[...slug]]`, and an **MCP server** at `/mcp` (tools: `search_docs`,
  `read_page`). Dynamic OG images at `/og/docs/[...slug]`.
- See [INTEGRATIONS.md](INTEGRATIONS.md) for the MCP + llms.txt surface.
