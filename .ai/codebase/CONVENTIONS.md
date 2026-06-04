# Conventions

Match these when editing. They are derived from the existing code, not invented here.
A more detailed implementation walkthrough also exists at
[.github/skills/tmdb-development/SKILL.md](../../.github/skills/tmdb-development/SKILL.md);
this file is the framework-neutral summary.

## Naming

| Thing | Style | Example |
|-------|-------|---------|
| Namespace properties / method names | `snake_case` | `tmdb.tv_series.aggregate_credits()` |
| Method params object fields | `snake_case` (mirror TMDB) | `movie_id`, `append_to_response`, `include_image_language` |
| Types / classes / interfaces | `PascalCase` | `MovieDetails`, `ApiClient`, `TMDBError` |
| Param types | `PascalCase` + `Params` suffix | `MovieDetailsParams`, `CollectionImagesParams` |
| Response types | descriptive `PascalCase` | `MovieCredits`, `MovieImages`, `PaginatedResponse<T>` |
| Endpoint source files | `snake_case.ts` | `endpoints/tv_series.ts` |
| Type source files | `kebab-case.ts` | `types/tv-series.ts` |
| Route constants | `SCREAMING_SNAKE` nested object | `ENDPOINTS.MOVIES.DETAILS` |

snake_case on the public surface is deliberate — it mirrors TMDB's own API field names so
the wrapper reads like the API it wraps.

## Formatting (enforced by oxfmt)
- **Tabs** for indentation, width 4.
- **printWidth 140**.
- Run `pnpm format` (or rely on the pre-commit hook). Do not hand-fight the formatter.
- No ESLint/Prettier — `oxlint` + `oxfmt` only.

## Endpoint method pattern
Every namespace method follows the same shape. Reads use `request`, writes use `mutate`.

```ts
// Read with language default merging + extra params via ...rest
async credits(params: MovieCreditsParams): Promise<MovieCredits> {
    const { movie_id, language = this.defaultOptions.language, ...rest } = params;
    const endpoint = this.movieSubPath(movie_id, ENDPOINTS.MOVIES.CREDITS);
    return this.client.request<MovieCredits>(endpoint, { language, ...rest });
}

// Mutation (never deduped/cached)
async create(body: V4CreateListBody): Promise<V4CreateListResponse> {
    return this.client.mutate<V4CreateListResponse>("POST", ENDPOINTS_V4.LISTS.DETAILS, body);
}
```

Rules of the pattern:
- **Routes come from `ENDPOINTS`** — never hardcode a URL fragment in an endpoint method.
- **Path params** (e.g. `movie_id`) are destructured out and interpolated into the path;
  the **rest** become query params.
- **Defaults** are merged from `this.defaultOptions` — prefer the base-class helpers
  (`withLanguage`, `applyDefaults`, `injectImageLanguage`) where they fit, or inline
  `language = this.defaultOptions.language` for the common single-field case.
- Provide the **return type generic** to `request`/`mutate` (`request<MovieCredits>(...)`).
- One JSDoc block per method with the HTTP line and a `@reference` link to the TMDB doc.

> **Consistency caveat:** when a param like `page` is optional, prefer spreading `...rest`
> so absent params are simply *not present*, rather than injecting `page: undefined`.
> Including `undefined` keys changes the params object shape that interceptors and tests
> observe. See [CONCERNS.md](CONCERNS.md) for the cautionary case.

## Type composition
The type layer composes small building blocks rather than repeating field lists.

- **Param utilities** ([types/common/params.ts]): `WithParams<K>`, and the presets
  `WithLanguage`, `WithPage`, `WithRegion`, `WithLanguagePage`, `WithPageAndDateRange`,
  `DateRange`. Compose with `&`:
  ```ts
  export type MovieReviewsParams = Prettify<MovieBaseParam & WithLanguagePage>;
  ```
- **`Prettify<T>`** ([types/utility.ts]) — wrap composed param/response types so the IDE
  shows the flattened shape on hover. Used pervasively.
- **`LiteralUnion<T>`** — literal autocomplete while still allowing any `string`.
- **`append_to_response` generics** — methods that support TMDB's append feature take a
  literal array type parameter and return a conditionally-widened type
  (e.g. `MovieDetailsWithAppends<T>`). Mirror an existing namespace (movies, tv-series)
  exactly when adding one.
- **Nullable API fields** are typed `field: T | null` even though the client sanitises
  `null → undefined` at runtime. Keep the annotation; be aware of the runtime reality.
- **Reuse `common/`**: `PaginatedResponse<T>`, media entities (`Cast`, `Crew`, `Genre`),
  image types, change/certification types. Don't re-declare them.

## Adding a new endpoint (checklist)
1. Add the URL fragment to `ENDPOINTS` in [routes.ts](../../packages/tmdb/src/routes.ts).
2. Define `Params` + response types in `types/<namespace>.ts`; export via `types/index.ts`.
3. Implement the method on the namespace class in `endpoints/<namespace>.ts`.
4. (New namespace only) register the class in [tmdb.ts](../../packages/tmdb/src/tmdb.ts)
   and export it from [index.ts](../../packages/tmdb/src/index.ts).
5. Add a unit test (mock `client.request`/`mutate`) and an integration test. See [TESTING.md](TESTING.md).
6. Add/refresh the Fumadocs MDX page(s).

## Imports & module rules
- ESM only. Use `import type { … }` for type-only imports (the codebase does this consistently).
- The library has **zero runtime dependencies** — do not add one without strong justification;
  prefer native platform APIs (`fetch`, `URL`, etc.).

## Commits & branches (from CLAUDE.md)
- Branch naming: `<type>/<issue-number>-<short-description>` (e.g. `fix/117-trending-page-param`).
  **Always include the issue number.**
- Don't edit the changelog unless explicitly releasing.
- Documentation changes go in the `docs` app, not scattered READMEs.
