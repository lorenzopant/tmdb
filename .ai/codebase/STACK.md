# Stack

Languages, runtimes, frameworks, and tooling. Versions reflect the lockfile/manifests at
time of writing — check `package.json` files and `pnpm-lock.yaml` for exact current values.

## Foundation

| Concern | Choice | Notes |
|---------|--------|-------|
| Language | TypeScript `^5.8` (library), `^6.0` (docs) | `strict: true` in the library. |
| Runtime | Node.js `>=20` | `.nvmrc` pins `20`. CI uses Node 20. |
| Package manager | pnpm `9.15.9` | Pinned via `packageManager` field and in CI. |
| Monorepo orchestration | Turborepo `2.9.1` | `turbo.json` defines the task graph. |
| Module system | ESM only | Library ships `"type": "module"`, ESM-only build. No CJS output. |

## Workspace: `@lorenzopant/tmdb` (the library)

| Concern | Choice | Notes |
|---------|--------|-------|
| Bundler | `tsdown` | Config in [packages/tmdb/tsdown.config.ts](../../packages/tmdb/tsdown.config.ts). Single entry `src/index.ts`, ESM, `dts: true`, `treeshake`, `minify`. |
| Output | `dist/index.mjs` + `dist/index.d.mts` | Declared in `exports`/`main`/`types`. |
| Test runner | Vitest `^4.1` | Config [packages/tmdb/vitest.config.mts](../../packages/tmdb/vitest.config.mts). `globals: true`, node environment. |
| Coverage | `@vitest/coverage-v8` | Excludes `src/types/**`, `dist/**`, `src/index.ts`. |
| HTTP | Native `fetch` | No axios/got. The runtime must provide global `fetch` (Node 20+ does). |
| Runtime deps | **none** | The library has zero production dependencies. Everything is dev-only. |

### Library dev tooling of note
- `ts-morph` — present in devDependencies (tooling/introspection).
- `tsx` — TS execution for scripts.
- `dotenv` — loads `.env` for integration tests (vitest `setupFiles`).

## Workspace: `docs` (the documentation site)

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | Next.js `16` (App Router) | [apps/docs/](../../apps/docs/). |
| UI runtime | React `19` | |
| Docs engine | Fumadocs (`fumadocs-core`, `fumadocs-ui`, `fumadocs-mdx`) | MDX-based docs. Content in `content/docs/`. |
| Styling | Tailwind CSS `4` (via `@tailwindcss/postcss`) | `class-variance-authority`, `tailwind-merge`. |
| Components | Radix UI primitives, `lucide-react` icons, `framer-motion` | |
| Validation | `zod` `4` | Used by the MCP server tool schemas and Fumadocs frontmatter schemas. |
| MCP server | `@modelcontextprotocol/sdk` | Exposes docs as MCP tools — see [INTEGRATIONS.md](INTEGRATIONS.md). |
| Analytics | `@vercel/analytics`, `@vercel/speed-insights` | Deployed on Vercel. |
| OG images | `@takumi-rs/image-response` | Dynamic OpenGraph image generation. |

> The docs app depends on the library via `workspace:*` (`@lorenzopant/tmdb`).

## Linting & formatting (whole repo)

| Tool | Role | Config |
|------|------|--------|
| **oxlint** (`oxlint`, `oxlint-tsgolint`) | Linter (Rust-based, fast) | [.oxlintrc.json](../../.oxlintrc.json) — minimal; `no-debugger: error`. Per-workspace overrides exist. |
| **oxfmt** | Formatter (Rust-based) | [.oxfmtrc.json](../../.oxfmtrc.json) — **tabs, width 4, printWidth 140**. |
| **lefthook** | Git hooks | [lefthook.yml](../../lefthook.yml) — pre-commit format+lint, pre-push lint/typecheck/build/test. |

There is **no ESLint or Prettier** — the `oxc` toolchain replaces both.

## Root scripts (Turborepo entry points)

Run from repo root (`package.json`):

| Script | Effect |
|--------|--------|
| `pnpm build` | `turbo run build` across workspaces. |
| `pnpm dev` | `turbo run dev` (persistent). |
| `pnpm check` | lint + typecheck + unit tests. |
| `pnpm test` / `pnpm test:unit` | Unit tests across workspaces. |
| `pnpm test:integration` | Integration tests (needs TMDB token). |
| `pnpm lint` / `pnpm format` / `pnpm typecheck` | The obvious. |
| `pnpm release:{patch,minor,major}` (+ `beta-*`) | Run `scripts/release.mjs` — see [INTEGRATIONS.md](INTEGRATIONS.md). |

See [TESTING.md](TESTING.md) for the test commands in detail and [STRUCTURE.md](STRUCTURE.md) for where each tool's config lives.
