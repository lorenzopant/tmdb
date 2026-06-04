# Claude Code Guidelines

## Codebase Map

Before exploring, read [.ai/codebase/](.ai/codebase/) — a framework-agnostic map of this
repository (stack, architecture, structure, conventions, testing, integrations, known
concerns). Start with [.ai/codebase/README.md](.ai/codebase/README.md). Keep it current:
if you make a structural change, update the affected document in the same change.

## Project Overview

pnpm + Turborepo monorepo with two workspaces:

- `packages/tmdb` — `@lorenzopant/tmdb`, a type-safe TMDB API wrapper. The published library.
  ESM-only, **zero runtime dependencies**, Node `>=20`, native `fetch`.
- `apps/docs` — Next.js + Fumadocs documentation site (also serves an MCP server and `llms.txt`).

`ApiClient` (`packages/tmdb/src/client.ts`) is the only code that calls `fetch`. Namespace
classes in `endpoints/` extend `TMDBAPIBase` and route through it. URL fragments live in
`routes.ts` (`ENDPOINTS`). The `TMDB` class (`tmdb.ts`) aggregates every namespace.

## Commands

- Build: `pnpm build` · Typecheck: `pnpm typecheck` · Lint: `pnpm lint` · Format: `pnpm format`
- Unit tests: `pnpm test:unit` (no network/token) · Integration: `pnpm test:integration`
  (needs `TMDB_BEARER_TOKEN`)
- Combined gate: `pnpm check` (lint + typecheck + unit tests)

Tooling is the `oxc` stack — **oxlint + oxfmt, not ESLint/Prettier**. Formatting is tabs,
width 4, printWidth 140. Git hooks (lefthook) run format/lint on commit and
lint/typecheck/build/test on push.

## Conventions

- Public surface (namespaces, methods, param fields) is `snake_case` to mirror the TMDB API.
  Types/classes are `PascalCase`; param types use the `Params` suffix.
- Routes come from `ENDPOINTS` — never hardcode URL fragments in endpoint methods.
- Endpoint files are `snake_case.ts`; type files are `kebab-case.ts`.
- Keep the library dependency-free; prefer native platform APIs.
- Full conventions + add-an-endpoint checklist: [.ai/codebase/CONVENTIONS.md](.ai/codebase/CONVENTIONS.md).

## Docs

When updating/writing documentation, refer to the "docs" application. Do not edit the changelog unless explicitly instructed to do so, for example you may be asked to update the changelog when releasing a new version. Otherwise stick to doc pages related to the task.

## Branch Naming

Always include the issue number in the branch name if available.
Format: `<type>/<issue-number>-<short-description>`

Examples:

- `fix/117-trending-page-param`
- `feat/42-add-discover-endpoint`
- `chore/88-update-deps`
