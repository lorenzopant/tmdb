# Concerns

Rough edges, known issues, and design constraints. Read before changing related code so
you don't reintroduce a known problem or break an intentional decision. This is a snapshot —
verify against the current code and issue tracker.

## Design constraints (intentional — respect these)

- **ESM-only.** The library ships no CommonJS build (`"type": "module"`, ESM-only tsdown
  output). Consumers on CJS must use dynamic `import()`. Don't add `require`-style code.
- **Zero runtime dependencies.** The package has no production deps and relies on platform
  `fetch`/`URL`. Adding a runtime dependency is a significant decision — prefer native APIs.
- **Node `>=20`.** Relies on global `fetch`. Don't add polyfills for older Node.
- **Nullable-as-`| null` in types, but `undefined` at runtime.** `sanitizeNulls()` converts
  every `null → undefined` recursively. Response types annotate `T | null` for fidelity to
  the API, but at runtime nullable fields arrive as `undefined`. Code that checks
  `=== null` on a response value will be wrong; check for `undefined`.

## Known issues / inconsistencies

### Params object *shape* matters (not just the URL)
`ApiClient` strips `undefined` params when building the URL, **but** the params object is
still passed verbatim to `client.request()`, to request interceptors, and is asserted on by
unit tests. Injecting keys like `page: undefined` when a caller didn't provide `page`
changes that observable shape and can break exact-match tests and interceptor logic.

**Convention:** build query params by spreading `...rest` (so absent optionals are simply
absent) rather than explicitly setting `key: undefined`. Most endpoints already do this;
some have been corrected to. When touching an endpoint, prefer the `...rest` form.

### `enum` usage under discussion (issue #122)
The library currently uses numeric TypeScript `enum`s in a few places
(`ReleaseType`, `DiscoverTVStatus`, `DiscoverTVType`, `TVEpisodeGroupType`). There is an open
proposal to replace them with `as const` objects (the widely-recommended TS pattern).

Key subtlety if this is implemented: **TMDB returns these values as numbers.** A naive
`{ 1: "Label" } as const` flips the type to string keys (`"1" | "2"`), which would be a
breaking change. The compatible replacement keeps **name → number** mapping
(`{ OriginalAirDate: 1 } as const`) with the type derived from values
(`typeof X[keyof typeof X]` → `1 | 2 | …`), optionally plus a separate label lookup map.
Don't "fix" the enums without preserving the numeric value type.

### File-naming inconsistency
Endpoint files are `snake_case` (`endpoints/tv_series.ts`) while type files are `kebab-case`
(`types/tv-series.ts`). This is established and not worth churning, but don't assume a
namespace's two files share the same casing when scripting against paths.

### `utils/index.ts` is a curated barrel
The utils barrel re-exports a **subset** (logger, jwt, types, pagination, and only
`RetryOptions` from retry). `ResponseCache`, `RateLimiter`, `RetryManager` classes are not
re-exported from `utils/index.ts` — they're imported directly by `client.ts`. If you expect
a util to be publicly exported, check `index.ts` (root) and this barrel.

### Error normalisation logs to console
`normalizeError()` in `client.ts` calls `console.error(...)` when the error body isn't JSON.
This is unconditional (not gated by the logger option). Be aware when reasoning about quiet
operation or test output noise.

## Things that look like bugs but aren't
- **`mutate()` accepts `"GET"`.** Intentional — a few TMDB endpoints are specified as `GET`
  but carry side effects (e.g. `GET /4/list/{id}/clear`), so they must bypass deduplication.
- **`request()` and `execute()` both run interceptors.** `request()` runs them once up front
  (so the cache/dedup key reflects post-interceptor values) and passes a flag so `execute()`
  skips re-running them. `mutate()` lets `execute()` run them. Not duplication.
- **Cache uses `has()` not a truthy check.** So a legitimately cached `undefined` (a response
  sanitised from `null`) still counts as a hit.

## Operational / process notes
- **Integration tests require a live token and network.** They will fail (not skip) locally
  if you run `test:integration` without `TMDB_BEARER_TOKEN`. The pre-push hook and CI guard
  this; ad-hoc runs don't.
- **Releases push directly to `main`.** Both `scripts/release.mjs` and the `trigger_release`
  CI job commit + push to `main` and push a tag. Treat the version bump as a release action,
  not a routine commit.
- **`.planning/` is git-ignored.** Don't put shared, tracked documentation there; this map
  lives in `.ai/codebase/` precisely so it is tracked and visible to all contributors.

## Not covered by this map (gaps to fill if needed)
- Exhaustive per-endpoint parameter/response documentation — that lives in the docs app
  (`apps/docs/content/docs/api-reference/`) and the TMDB official reference.
- The full `append_to_response` type mechanics per namespace — read the relevant
  `types/<ns>.ts` (movies/tv-series are the richest examples).
