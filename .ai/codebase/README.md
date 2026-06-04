# Codebase Map

Framework-agnostic reference for AI agents (and humans) working in this repository.
These documents describe **what exists and how it fits together** so an agent can orient
quickly without re-deriving structure from scratch. They are git-tracked so any
contributor's agent can read them.

> **Scope note:** This map is descriptive, not prescriptive. It is not tied to any
> agent framework or workflow tool. Read the file relevant to your task; you do not
> need to read all of them.

## What this repository is

A pnpm + Turborepo **monorepo** containing two workspaces:

| Workspace | Path | What it is |
|-----------|------|------------|
| `@lorenzopant/tmdb` | [packages/tmdb/](../../packages/tmdb/) | A fully type-safe TypeScript wrapper for The Movie Database (TMDB) REST API. The published library. |
| `docs` | [apps/docs/](../../apps/docs/) | The documentation site (Next.js + Fumadocs), including an MCP server and `llms.txt` endpoints. |

The library is the product. The docs app documents it. Everything else (CI, release
scripts, git hooks) exists to ship and validate the library.

## Document index

| Document | Read it when you need to… |
|----------|---------------------------|
| [STACK.md](STACK.md) | Know languages, runtimes, frameworks, tooling, and versions. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Understand the runtime design: how a call flows from `tmdb.movies.details()` to an HTTP response. |
| [STRUCTURE.md](STRUCTURE.md) | Find where things live — directory + file layout, with the role of each area. |
| [CONVENTIONS.md](CONVENTIONS.md) | Match existing style: naming, type composition, formatting, the add-an-endpoint pattern. |
| [TESTING.md](TESTING.md) | Write or run tests — unit vs integration, mocking patterns, commands. |
| [INTEGRATIONS.md](INTEGRATIONS.md) | Understand external dependencies: TMDB API v3/v4, JustWatch, npm provenance, Vercel. |
| [CONCERNS.md](CONCERNS.md) | Know the rough edges, known issues, and design constraints before changing things. |

## Fastest possible orientation

- **Library entry point:** [packages/tmdb/src/index.ts](../../packages/tmdb/src/index.ts) — public exports.
- **Top-level facade:** [packages/tmdb/src/tmdb.ts](../../packages/tmdb/src/tmdb.ts) — the `TMDB` class wiring every namespace.
- **HTTP engine:** [packages/tmdb/src/client.ts](../../packages/tmdb/src/client.ts) — `ApiClient`, the only place that calls `fetch`.
- **URL registry:** [packages/tmdb/src/routes.ts](../../packages/tmdb/src/routes.ts) — `ENDPOINTS` constant, single source of truth for paths.
- **One endpoint per file:** [packages/tmdb/src/endpoints/](../../packages/tmdb/src/endpoints/) — all extend `TMDBAPIBase`.
- **One type file per namespace:** [packages/tmdb/src/types/](../../packages/tmdb/src/types/).

## Keeping this map current

These docs reflect the codebase at the time of writing. If you make a structural change
(new namespace, new client capability, moved directories, changed tooling), update the
affected document in the same change. Treat a stale map as a bug.
