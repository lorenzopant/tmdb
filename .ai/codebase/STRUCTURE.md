# Structure

Where things live. Use this to locate the right file before reading or editing.

## Repository root

```
tmdb/
├── packages/tmdb/        # The library  (@lorenzopant/tmdb)
├── apps/docs/            # Documentation site (Next.js + Fumadocs)
├── scripts/release.mjs   # Version bump + tag push (triggers npm publish via CI)
├── .github/              # CI workflows, issue/PR templates, a dev skill doc
├── turbo.json            # Turborepo task graph
├── pnpm-workspace.yaml   # Workspaces: apps/*, packages/*
├── lefthook.yml          # Git hooks (pre-commit, pre-push)
├── .oxlintrc.json        # Lint config (root)
├── .oxfmtrc.json         # Format config (tabs, width 4, printWidth 140)
├── .nvmrc                # Node 20
└── CLAUDE.md             # Repo-specific agent instructions (branch naming, docs policy)
```

> Generated/ignored at root: `node_modules/`, `dist/`, `coverage/`, `.turbo/`, `.planning/`
> (the `.planning/` directory is git-ignored — do not place shared docs there).

## Library: `packages/tmdb/`

```
packages/tmdb/
├── src/
│   ├── index.ts          # PUBLIC API — every export the package exposes
│   ├── tmdb.ts           # TMDB class (v3 facade, aggregates all namespaces)
│   ├── tmdb.v4.ts        # TMDBv4 class (v4 sub-facade: auth, account, lists)
│   ├── client.ts         # ApiClient — HTTP engine, the only fetch() caller
│   ├── routes.ts         # ENDPOINTS + ENDPOINTS_V4 — URL fragment registry
│   ├── endpoints/        # One file per API namespace (see below)
│   │   ├── base.ts       # TMDBAPIBase abstract class
│   │   └── v4/           # v4 namespaces: auth.ts, account.ts, lists.ts
│   ├── types/            # One file per namespace + common/ + config/ + v4/
│   │   ├── index.ts      # Barrel re-export of all type files
│   │   ├── common/       # PaginatedResponse, params, images, media, changes, certifications
│   │   ├── config/       # Language, CountryISO3166_1, Timezone, TMDBOptions, ImagesConfig, options
│   │   ├── v4/           # v4 auth + lists types
│   │   └── utility.ts    # Prettify, LiteralUnion, KnownFor guards
│   ├── images/images.ts  # ImageAPI — URL builder + response image transforms
│   ├── errors/
│   │   ├── tmdb.ts       # TMDBError class + TMDBAPIErrorResponse type
│   │   └── messages.ts   # Errors — centralised message constants
│   ├── utils/            # cache, rate-limiter, retry, jwt, logger, pagination, types
│   │   └── index.ts      # Barrel (note: re-exports a curated subset)
│   └── tests/            # Mirrors namespace structure; one folder per namespace
├── tsdown.config.ts      # Build config
├── vitest.config.mts     # Test config
├── tsconfig.json         # strict; excludes tests + dist from build
├── llms.txt / llms-full.txt  # Shipped LLM-readable summaries (in npm `files`)
└── package.json          # name, version, exports, scripts
```

### `endpoints/` — namespace classes (all `extends TMDBAPIBase`)
One class per TMDB namespace. v3 namespaces (29 files) sit directly in `endpoints/`; v4
namespaces live in `endpoints/v4/`. Representative set:

`account`, `authentication`, `certifications`, `changes`, `collections`, `companies`,
`configuration`, `credits`, `discover`, `find`, `genres`, `guest_sessions`, `keywords`,
`lists`, `movie_lists`, `movies`, `networks`, `people`, `people_lists`, `reviews`, `search`,
`trending`, `tv_episode_groups`, `tv_episodes`, `tv_seasons`, `tv_series`, `tv_series_lists`,
`watch_providers` — plus `v4/{auth,account,lists}`.

**Pattern:** each method builds an endpoint from `ENDPOINTS`, destructures params (merging
`defaultOptions` defaults), and calls `this.client.request(...)` (reads) or
`this.client.mutate(...)` (writes). See [CONVENTIONS.md](CONVENTIONS.md).

### `types/` — one file per namespace
Each namespace has a matching type file (`movies.ts`, `tv-series.ts`, …) re-exported from
`types/index.ts`. Shared building blocks live in `types/common/` and `types/config/`.

> **Naming note:** endpoint files use `snake_case` (`tv_series.ts`), most type files use
> `kebab-case` (`tv-series.ts`). Don't assume they match exactly.

### `tests/` — mirrors namespaces
`tests/<namespace>/<namespace>.test.ts` (unit) and `<namespace>.integration.test.ts`
(integration). Plus `tests/client/` (8 files covering each ApiClient capability) and
`tests/utils/`. See [TESTING.md](TESTING.md).

## Docs app: `apps/docs/`

```
apps/docs/
├── app/                  # Next.js App Router
│   ├── (home)/           # Landing page
│   ├── docs/[[...slug]]/  # Catch-all docs page renderer
│   ├── api/search/       # Docs search route
│   ├── mcp/route.ts      # MCP server (search_docs, read_page tools)
│   ├── llms.txt/         # /llms.txt route handler
│   ├── llms-full.txt/    # /llms-full.txt route handler
│   ├── llms.mdx/docs/[[...slug]]/  # Per-page raw markdown
│   └── og/docs/[...slug]/ # Dynamic OG image generation
├── content/docs/         # MDX source (≈239 files)
│   ├── getting-started/  # Guides + options/
│   ├── api-reference/    # One folder per namespace, one MDX per method (+ v4/)
│   └── types/            # One MDX per namespace type file
├── components/           # React components (incl. ai/, ui/, type-table)
├── lib/                  # source.ts (Fumadocs loader), get-llm-text.ts, cn.ts, layout
├── source.config.ts      # Fumadocs MDX collection config
└── next.config.mjs
```

The docs app imports the library via `workspace:*`, so type tables and examples stay in
sync with the actual package.

## Where to make common changes

| Task | Touch |
|------|-------|
| Add an API method to an existing namespace | `endpoints/<ns>.ts`, `types/<ns>.ts`, `routes.ts` (if new path), `tests/<ns>/`, docs MDX |
| Add a whole new namespace | all of the above + register it in `tmdb.ts` and export in `index.ts` |
| Change HTTP behaviour (cache, retry, dedup…) | `client.ts` + the relevant `utils/*` + `tests/client/` |
| Add a config option | `types/config/options.ts` (`TMDBOptions`) + wire through `tmdb.ts` → `client.ts` |
| Change image URL logic | `images/images.ts` + `types/config/images.ts` |
| Document something | `apps/docs/content/docs/...` (per repo policy, see CLAUDE.md) |
