# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

`tmdb-monorepo` — a pnpm + Turborepo workspace holding:

| Workspace       | Name                | Purpose                                                                   |
| --------------- | ------------------- | ------------------------------------------------------------------------- |
| `packages/tmdb` | `@lorenzopant/tmdb` | Published, fully-typed TypeScript SDK for the TMDB API (v3 + partial v4). |
| `apps/docs`     | `docs`              | Fumadocs (Next.js 16 App Router) documentation site + `/mcp` docs server. |

Workspace globs: `apps/*`, `packages/*` (`pnpm-workspace.yaml`). Node `>=20` (`.nvmrc` = 20), pnpm `9.15.9` (pinned via `packageManager` and in CI).

A detailed, step-by-step implementation playbook for adding endpoints/types/docs lives in
`.github/skills/tmdb-development/SKILL.md` — read it before adding a new namespace or endpoint.
This file covers the current state of conventions and tooling.

## Commands

Run from the repo root; Turborepo fans out to workspaces.

```bash
pnpm install              # also installs Lefthook git hooks
pnpm dev                  # docs site on http://localhost:3000 (+ tsdown --watch for the SDK)
pnpm build                # turbo run build
pnpm lint                 # oxlint
pnpm lint:check           # oxlint --type-aware --type-check (what CI runs; needs a prior build)
pnpm format               # oxfmt
pnpm typecheck            # tsc --noEmit per workspace
pnpm test / test:unit     # vitest, excludes *.integration.test.ts and *.drift.test.ts
pnpm test:integration     # live TMDB calls — requires TMDB_BEARER_TOKEN
pnpm test:drift           # regenerates the type-tree baseline, then live shape check
pnpm test:coverage        # unit suite with coverage
pnpm test:watch|test:ui   # scoped to packages/tmdb
pnpm check                # lint + typecheck + test:unit (pre-push parity)
```

Package-scoped work: `pnpm --filter @lorenzopant/tmdb run <script>`.

Env vars (both read from `.env` via `dotenv/config` in the vitest setup, and declared in
`turbo.json` `globalEnv`): `TMDB_BEARER_TOKEN`, `TMDB_API_KEY`.

## Tooling

- **Formatter/linter: oxfmt + oxlint** (not Prettier/ESLint).
    - `.oxfmtrc.json`: **tabs**, `tabWidth: 4`, `printWidth: 140`.
    - `.oxlintrc.json`: only `no-debugger: error` is configured explicitly; `lint:check` adds
      type-aware rules, so a type-aware violation can fail CI while plain `pnpm lint` passes.
    - Suppress a specific rule inline with `// oxlint-disable-next-line <rule>` (see `client.ts`).
- **Build: tsdown** (`packages/tmdb/tsdown.config.ts`) — ESM only, `dts: true`, minified, treeshaken,
  no sourcemaps. Two entries: `src/index.ts` → `dist/index.mjs`, `src/image.ts` → `dist/image.mjs`
  (the `@lorenzopant/tmdb/image` subpath export).
- **Tests: Vitest 4**, `globals: true`, `environment: "node"`, coverage excludes `src/types/**`,
  `dist/**`, `src/index.ts`.
- **Git hooks: Lefthook** (`lefthook.yml`).
    - pre-commit: `oxfmt` on staged files (auto-staged) + `oxlint --quiet`.
    - pre-push (piped): lint → typecheck → build → unit tests, plus integration tests **only if**
      `TMDB_BEARER_TOKEN` is set.
    - Local overrides go in `lefthook-local.yml`.
- **TypeScript**: `strict: true`, `target`/`module` ESNext, `moduleResolution: "bundler"`,
  `skipLibCheck: true`. The SDK tsconfig `include`s only `src` and excludes tests.

## SDK architecture (`packages/tmdb/src`)

```
client.ts        ApiClient — the only HTTP layer (fetch, auth, dedup, cache, rate limit, retry,
                 interceptors, null-sanitisation, image path autocomplete, error mapping)
tmdb.ts          TMDB class — instantiates one ApiClient and every *API namespace
tmdb.v4.ts       TMDBv4 — lazily built via the `tmdb.v4` getter; throws unless the token is a JWT
routes.ts        ENDPOINTS — single source of truth for every URL fragment
index.ts         public exports (classes, `export * from "./types"`, `export * from "./utils"`)
image.ts         standalone ImageAPI entry (token-free URL building)
endpoints/       one file per namespace; `base.ts` holds the TMDBAPIBase abstract class
endpoints/v4/    account.ts, auth.ts, lists.ts
types/           one file per namespace + `common/` (pagination, params, images, media…) and
                 `config/` (Language, CountryISO3166_1, TMDBOptions, ImagesConfig, timezones…)
errors/          TMDBError class + Errors / TMDB_ERRORS message maps
images/          ImageAPI URL builder (no HTTP)
utils/           cache, jwt, logger, pagination, rate-limiter, retry, types
drift/           live-API-vs-types shape drift suite + generated baseline
tests/           mirrors the endpoint layout — one folder per namespace
```

### Conventions

| Thing                | Convention                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API class            | `<Domain>API` — `MoviesAPI`, `TVSeriesAPI`, `V4ListsAPI`; extends `TMDBAPIBase`                                                                                        |
| Namespace property   | `snake_case` — `tmdb.tv_series`, `tmdb.watch_providers`, `tmdb.people_lists`                                                                                           |
| Method name          | `snake_case` mirroring the TMDB endpoint — `alternative_titles`, `watch_providers`                                                                                     |
| Type name            | `PascalCase` — `MovieDetails`, `TVSeriesCredits`                                                                                                                       |
| Params type          | `<Domain><Method>Params` — `MovieDetailsParams`                                                                                                                        |
| Route constants      | `SCREAMING_SNAKE_CASE` inside the `ENDPOINTS` object in `routes.ts`                                                                                                    |
| Exports              | Named exports only; no default exports                                                                                                                                 |
| Nullable API fields  | Declared **optional** (`backdrop_path?: string`) — `ApiClient.sanitizeNulls` converts every `null` to `undefined` before the response is returned                      |
| Shared params        | Compose from `types/common/params.ts` — `WithLanguage`, `WithPage`, `WithLanguagePage`, `WithRegion`, `DateRange` — never re-declare `language`/`page`/`region` inline |
| Paginated responses  | `PaginatedResponse<T>` from `types/common/pagination.ts`                                                                                                               |
| Image responses      | `ImagesResult<ImageItem, "backdrops" \| "logos" \| "posters">`                                                                                                         |
| `append_to_response` | Namespace union + appendable map + `…DetailsWithAppends<T>` conditional return                                                                                         |
| Doc comments         | TSDoc on every public method: title, `GET - <full url>`, prose, `@param`s, `@returns`, `@reference <developer.themoviedb.org link>`; TSDoc on type fields              |
| Path helpers         | Private `<domain>Path(id)` / `<domain>SubPath(id, route)` methods on the class                                                                                         |

Base-class helpers — pick deliberately:

- `applyDefaults(params)` — merges default `language` **and** `region`; list/search endpoints.
- `withLanguage(params)` — merges `language` only; images/translations endpoints.
- `injectImageLanguage(params)` / `injectImageLanguageForAppends(params)` — derive
  `include_image_language` from `images.image_language_priority`; the `…ForAppends` variant only
  fires when `append_to_response` actually asks for `images`.
- Or explicit destructure `const { language = this.defaultOptions.language, ...rest } = params;`
  for details endpoints needing fine-grained control.

Hard rules:

- New URL strings go in `routes.ts` — nowhere else.
- All HTTP goes through `ApiClient.request`; endpoint classes never call `fetch`.
- Register every new namespace as a `public` property in `tmdb.ts`, export the class from
  `index.ts`, and re-export its types from `types/index.ts`.
- Keep shared entities in `types/common/` to avoid circular imports between namespace type files.
- `.filter()` does not narrow discriminated unions — use a type predicate
  (`.filter((item): item is MovieResultItem => item.media_type === "movie")`).

## Testing

Three suites, separated by filename:

1. **Unit** — `src/tests/<namespace>/<namespace>.test.ts`. Construct `new ApiClient("valid_access_token")`,
   replace `clientMock.request = vi.fn()`, assert the exact endpoint string and params passed
   (`expect(clientMock.request).toHaveBeenCalledWith("/movie/550/alternative_titles", { country: "US" })`).
   Imports come from `"vitest"` explicitly even though `globals: true`.
2. **Integration** — `*.integration.test.ts`, real TMDB calls, throws at module load if
   `TMDB_BEARER_TOKEN` is missing. Assert **contract, not content**: shape and stable ids
   (movie 550 = Fight Club, series 1396 = Breaking Bad), never volatile live data such as
   list lengths, popularity, or "changes in the last day".
3. **Drift** — `src/drift/`. The baseline in `src/drift/__generated__/type-tree.json` is generated
   _from the TypeScript types_ by `scripts/gen-type-tree.ts`, so a failure means the live API and
   `src/types` disagree right now: `+ path` = API field the types don't declare, `- path` = required
   type field the API stopped returning. Fix by editing `src/types` and rerunning
   `pnpm test:drift` — there is no "bless the snapshot" step. Runs weekly in CI
   (`.github/workflows/drift.yml`), which opens/updates a single "TMDB schema drift detected" issue.

## Docs app (`apps/docs`)

- Next.js 16 App Router, React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), Fumadocs 16,
  `fumadocs-mdx` collections configured in `source.config.ts` (`content/docs`).
- `fumadocs-mdx` codegen must run before typecheck/lint — handled by the `postinstall`,
  `pretypecheck`, and `prelint:check` scripts. Don't typecheck the docs app on a cold checkout
  without installing first.
- Import alias `@/*` → app root. `lib/cn.ts` for class merging, `components/ui` for primitives
  (radix-ui via the Fumadocs CLI, see `cli.json`).
- Content layout: `content/docs/api-reference/<namespace>/<method>.mdx`,
  `content/docs/types/<namespace>.mdx`, `content/docs/getting-started/`, `content/docs/changelog.mdx`.
- MDX page conventions (details and the `TypeTable` vs `AutoTypeTable` rule are in the skill file):
  frontmatter `title` + `description`; a signature code block; a TMDB reference blockquote;
  Parameters; Returns (prose with links for paginated responses); Example; Related Types.
  Use `<TypeTable />` — not a markdown table — whenever params include `language`,
  `include_image_language`, `region`, or `country`.
- The site also serves `/mcp` (MCP docs server), `/llms.txt`, `/llms-full.txt`, and OG images
  (`@takumi-rs/image-response`, listed in `serverExternalPackages`).

## Changelog & releases

- Changelog is documentation: `apps/docs/content/docs/changelog.mdx`. Add an entry for any
  user-visible SDK change, and drop the "new" label from entries that are no longer the latest.
- Version lives in `packages/tmdb/package.json` only (the docs app is `private`, version `0.0.0`).
- Release from a clean tree on `main`: `pnpm release:patch|minor|major`
  (or `release:beta-patch|beta-minor|beta-major` → `preid=beta`). `scripts/release.mjs` bumps,
  commits, pushes, and tags `vX.Y.Z`; the tag push triggers `.github/workflows/publish.yml`, which
  builds and runs `npm publish --provenance` (beta versions publish under the `beta` tag) and cuts
  a GitHub release. The same workflow can be started from the Actions UI via `workflow_dispatch`.
- Never run `npm publish` locally — provenance depends on the CI OIDC identity.

## CI (`.github/workflows/ci.yml`)

On push/PR to `main` and `develop`, four independent jobs: `lint` (`lint:check`), `typecheck`,
`unit-tests`, and `integration-tests` (skipped on fork PRs, since secrets are unavailable there).

## Conventions for changes you make

- Commits: Conventional Commits with a scope, e.g. `fix(endpoints): forward include_image_language on details() appends`,
  `feat(tmdb): add standalone /image subpath export for ImageAPI`, `docs(types): …`, `test(tmdb): …`,
  `chore(deps): …`. Release commits are `chore: release vX.Y.Z`.
- Branch off `main` with a `type/short-description` name (`fix/image-path-guards-preserve-input-type`).
- Before pushing: `pnpm check` (and `pnpm test:integration` if you have a token) — pre-push runs
  the same gates anyway.
- A behaviour change to the SDK usually touches four places: `src/`, `src/tests/`,
  `apps/docs/content/docs/`, and `changelog.mdx`. Don't stop at the first one.
