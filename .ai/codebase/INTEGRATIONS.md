# Integrations

External systems, APIs, and infrastructure this codebase depends on or exposes.

## TMDB REST API (the wrapped service)
The whole library exists to wrap this.

| Aspect | Detail |
|--------|--------|
| v3 base URL | `https://api.themoviedb.org/3` |
| v4 base URL | `https://api.themoviedb.org/4` (used by `TMDBv4`) |
| Auth — API key | `?api_key=<key>` query param (v3 only). |
| Auth — Bearer/JWT | `Authorization: Bearer <token>` header. **Required for v4** and account/session features. |
| Auth detection | `isJwt()` ([utils/jwt.ts]) decides which auth style to use per request. |
| Official reference | `https://developer.themoviedb.org/reference/<endpoint>` — every endpoint method links to its page via `@reference`. |
| Errors doc | `https://developer.themoviedb.org/docs/errors` — mapped into `TMDBError`. |

Tokens used in tests/CI: `TMDB_BEARER_TOKEN`, `TMDB_API_KEY` (declared as Turbo `globalEnv`
and as CI secrets).

## JustWatch (transitive, attribution-required)
Watch-provider data (`*.watch_providers()`) is powered by TMDB's JustWatch partnership.
**Attribution to JustWatch is contractually required** when displaying this data, and deep
links must route through the provided TMDB URL. This is a usage constraint, not a code
dependency — keep it in mind for any feature surfacing provider data.

## npm registry (publishing)
- Package: `@lorenzopant/tmdb`, public, MIT.
- Published with **provenance** (`npm publish --provenance`) via GitHub Actions OIDC
  (`id-token: write`). Beta versions publish under the `beta` dist-tag.
- Published `files`: `dist`, `README.md`, `llms.txt`, `llms-full.txt`.

### Release flow
Two equivalent triggers, both ending in a tag push that drives publish:

1. **Local:** `pnpm release:{patch|minor|major|beta-*}` → [scripts/release.mjs](../../scripts/release.mjs)
   bumps the version, commits to `main`, pushes, and pushes a `v*` tag.
2. **GitHub UI:** `publish.yml` `workflow_dispatch` (`trigger_release` job) does the same bump
   + tag push server-side.

Then `publish.yml` `publish_release` job (on `v*.*.*` tag push):
checks if the version already exists on npm → install → build → `npm publish --provenance`
→ create a GitHub release with generated notes.

## CI (GitHub Actions)
| Workflow | Trigger | Jobs |
|----------|---------|------|
| [ci.yml](../../.github/workflows/ci.yml) | push/PR to `main`/`develop` | `unit-tests` (always), `integration-tests` (skipped on fork PRs — secrets unavailable). |
| [publish.yml](../../.github/workflows/publish.yml) | `workflow_dispatch` or `v*` tag push | `trigger_release` and/or `publish_release` (see release flow). |

All jobs: Node 20 + pnpm 9.15.9, `pnpm install --frozen-lockfile`.

## Git hooks (lefthook)
[lefthook.yml](../../lefthook.yml):
- **pre-commit** (parallel): `oxfmt` on staged files (auto-stages fixes), `oxlint` on staged JS/TS.
- **pre-push** (piped, ordered): `lint` → `typecheck` → `build` → `test:unit` → `integration`
  (integration only if `TMDB_BEARER_TOKEN` is set).

## Documentation site exposes machine-readable surfaces
The docs app (`apps/docs`) is itself an integration surface for AI tools:

| Surface | Route | Purpose |
|---------|-------|---------|
| **MCP server** | `/mcp` ([app/mcp/route.ts](../../apps/docs/app/mcp/route.ts)) | Model Context Protocol server over Streamable HTTP. Tools: `search_docs` (query → matching pages), `read_page` (slug → full markdown). Stateless, CORS-open. |
| `llms.txt` | `/llms.txt` | Index summary for LLMs. |
| `llms-full.txt` | `/llms-full.txt` | Full concatenated docs for LLMs. |
| Per-page markdown | `/llms.mdx/docs/[[...slug]]` | Raw markdown of a single page. |
| OG images | `/og/docs/[...slug]` | Dynamic social images. |

The library package **also ships** static `llms.txt` / `llms-full.txt` inside the npm tarball.

## Hosting / analytics
- Docs deployed on **Vercel** (`@vercel/analytics`, `@vercel/speed-insights`).
- Homepage: `https://tmdb.lorenzopant.dev`.

## Environment variables
| Var | Where | Purpose |
|-----|-------|---------|
| `TMDB_BEARER_TOKEN` | tests, CI, pre-push | JWT bearer for v4 + authed endpoints + integration tests. |
| `TMDB_API_KEY` | tests, CI | v3 API-key auth path. |

`.env` files are git-ignored; `.env.example` documents the expected keys for the library.
