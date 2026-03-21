---
name: tmdb-development
description: "TypeScript development for the @lorenzopant/tmdb package. Use when: adding a new TMDB API endpoint, namespace, or method; writing or updating types for TMDB responses; implementing or fixing API clients; generating Fumadocs MDX documentation; writing vitest unit/integration tests; working with routes, images, or the monorepo build. Covers naming conventions (snake_case methods, PascalCase types), type composition, test patterns, and the full implementation workflow: research → types → implementation → tests → docs."
---

# TMDB Package Development

## When to Use

- Adding a new TMDB API namespace or endpoint method
- Creating or updating TypeScript types for API responses
- Writing unit or integration tests (`vitest`)
- Adding or updating Fumadocs MDX documentation pages
- Debugging the API client, routes, or image URL builders

---

## Monorepo Structure

```
packages/tmdb/src/
├── client.ts            # HTTP layer (ApiClient)
├── tmdb.ts              # Top-level TMDB class (aggregates all API classes)
├── routes.ts            # ENDPOINTS constant — single source of truth for URL fragments
├── index.ts             # Public exports
├── endpoints/           # One file per API namespace
│   └── base.ts          # TMDBAPIBase abstract class (all APIs extend this)
├── types/               # One file per namespace + common/ and config/
│   ├── common/          # Shared: PaginatedResponse, params, images, media entities
│   └── config/          # Language, CountryISO3166_1, TMDBOptions, ImagesConfig
├── images/images.ts     # ImageAPI — URL builder (not HTTP)
├── errors/              # TMDBError class and error messages
├── utils/logger.ts      # TMDBLogger
└── tests/               # Mirrors endpoint structure; one folder per namespace

apps/docs/content/docs/
├── api-reference/       # One folder per namespace, one MDX per method
└── types/               # One MDX per namespace type file
```

---

## Full Implementation Workflow

### Step 1 — Research the TMDB API

Before writing any code, explore the official TMDB API docs thoroughly:

1. Navigate to `https://developer.themoviedb.org/reference/<namespace>` for every endpoint in the target namespace.
2. For **each endpoint**, make real requests with different parameter combinations:
    - Without optional params (minimal call)
    - With `language` set to multiple values
    - With `include_image_language`, `region`, `page`, `country`, etc. where applicable
    - With `append_to_response` if supported
3. Document all response fields, noting:
    - Which fields are nullable (`string | null` vs `string`)
    - Which are optional vs always present
    - Fields that are arrays of objects (need nested types)
    - Enum-like string fields (consider union types)
4. Check for response shape differences across parameter combinations — these may require overloads or conditional return types.

### Step 2 — Create Types (`packages/tmdb/src/types/<namespace>.ts`)

**Naming conventions:**

- Domain types: `PascalCase` matching the TMDB concept (`MovieDetails`, `TVSeriesCredits`)
- Params types suffix: `Params` (`MovieDetailsParams`, `CollectionImagesParams`)
- Response types: descriptive (`MovieCredits`, `MovieImages`)
- Nullable fields from API: use `field: string | null` (the client sanitizes nulls to `undefined` at runtime, check `client.ts` for details)

**Reuse existing building blocks from `types/common/`:**

```ts
import type { PaginatedResponse } from "./common/pagination";
import type { Language } from "./config/languages";
import type { CountryISO3166_1 } from "./config/countries";
import type { ImageItem, ImagesResult } from "./common/images";
import type { Cast, Crew, Genre } from "./common/media";
// Compose params with utility types:
import type { WithLanguage, WithPage, DateRange } from "./common/params";
```

**Param type composition pattern:**

```ts
// Use intersection/utility types — do not repeat language/page/region inline
export type SearchMoviesParams = {
	query: string;
	include_adult?: boolean;
	primary_release_year?: number;
} & WithLanguage &
	WithPage;

// Or explicit (for single params):
export type CollectionDetailsParams = {
	collection_id: number;
	language?: Language;
};
```

**Image result types:**

```ts
// Use the generic helper
export type MovieImages = ImagesResult<ImageItem, "backdrops" | "logos" | "posters">;
export type TVSeriesImages = ImagesResult<ImageItem, "backdrops" | "logos" | "posters">;
```

**`append_to_response` pattern (for detail endpoints that support it):**

```ts
export type MovieAppendToResponseNamespace = "alternative_titles" | "credits" | "images" | "videos" | "keywords";

export type MovieAppendableMap = {
	credits: MovieCredits;
	images: MovieImages;
	videos: MovieVideos;
	// ...
};

export type MovieDetailsWithAppends<T extends readonly MovieAppendToResponseNamespace[]> = MovieDetails & {
	[K in T[number]]: MovieAppendableMap[K];
};
```

**Export all types** from `types/index.ts`:

```ts
export type * from "./movies";
export type * from "./<new-namespace>";
```

### Step 3 — Add Route Constants (`routes.ts`)

Add new URL fragments to `ENDPOINTS` in `SCREAMING_SNAKE_CASE`:

```ts
export const ENDPOINTS = {
	// existing...
	NEW_NAMESPACE: {
		DETAILS: "/new-path",
		SUBRESOURCE: "/subresource",
	},
};
```

### Step 4 — Implement the API Class (`endpoints/<namespace>.ts`)

All classes **must extend `TMDBAPIBase`** and follow these conventions:

**File template:**

```ts
import type { ApiClient } from "../client";
import type { TMDBOptions } from "../types";
import type { NewNamespaceDetail, NewNamespaceParams } from "../types/<namespace>";
import { ENDPOINTS } from "../routes";
import { TMDBAPIBase } from "./base";

export class NewNamespaceAPI extends TMDBAPIBase {
	constructor(client: ApiClient, defaultOptions: TMDBOptions = {}) {
		super(client, defaultOptions);
	}

	// Path builders for ID-based endpoints (private helpers)
	private namespacePath(id: number): string {
		return `${ENDPOINTS.NEW_NAMESPACE.DETAILS}/${id}`;
	}

	private namespaceSubPath(id: number, route: string): string {
		return `${this.namespacePath(id)}${route}`;
	}

	// Standard method — destructure language with defaultOptions fallback
	async details(params: NewNamespaceDetailsParams): Promise<NewNamespaceDetail> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = this.namespacePath(rest.namespace_id);
		return this.client.request<NewNamespaceDetail>(endpoint, { language, ...rest });
	}

	// For search-style / list endpoints — use applyDefaults()
	async list(params: NewNamespaceListParams): Promise<PaginatedResponse<NewNamespaceItem>> {
		return this.client.request<PaginatedResponse<NewNamespaceItem>>(ENDPOINTS.NEW_NAMESPACE.LIST, this.applyDefaults(params));
	}

	// For images endpoints — use withLanguage()
	async images(params: NewNamespaceImagesParams): Promise<NewNamespaceImages> {
		const endpoint = this.namespaceSubPath(params.namespace_id, ENDPOINTS.NEW_NAMESPACE.IMAGES);
		return this.client.request<NewNamespaceImages>(endpoint, this.withLanguage(params) ?? params);
	}

	// For endpoints without params
	async latest(): Promise<NewNamespaceDetail> {
		return this.client.request<NewNamespaceDetail>(`${ENDPOINTS.NEW_NAMESPACE.DETAILS}${ENDPOINTS.NEW_NAMESPACE.LATEST}`);
	}

	// For append_to_response support — use generic overload
	async details<T extends readonly NewNamespaceAppendToResponseNamespace[] = []>(
		params: NewNamespaceDetailsParams & { append_to_response?: T },
	): Promise<T extends [] ? NewNamespaceDetail : NewNamespaceDetailWithAppends<T>> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = this.namespacePath(rest.namespace_id);
		return this.client.request(endpoint, { language, ...rest });
	}
}
```

**Method naming rules:**

- Use `snake_case` matching TMDB endpoint names: `alternative_titles`, `watch_providers`, `aggregate_credits`
- No camelCase for public methods

**Base class helpers (choose the right one):**

- `this.applyDefaults(params)` — merges `language` and `region` from `defaultOptions` into params. Use for search and list endpoints.
- `this.withLanguage(params)` — merges only `language`. Use for images and translation endpoints.
- Explicit destructure `const { language = this.defaultOptions.language, ...rest } = params;` — use for detail endpoints where you need fine-grained control.

### Step 5 — Register in `TMDB` class (`tmdb.ts`)

```ts
import { NewNamespaceAPI } from "./endpoints/<namespace>";

export class TMDB {
	public new_namespace: NewNamespaceAPI;

	constructor(accessToken: string, options: TMDBOptions = {}) {
		// ...existing...
		this.new_namespace = new NewNamespaceAPI(this.client, this.options);
	}
}
```

Export the class from `index.ts` if it needs to be directly instantiable.

### Step 6 — Write Tests (`tests/<namespace>/`)

**Unit test file** (`<namespace>.test.ts`):

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../client";
import { NewNamespaceAPI } from "../../endpoints/<namespace>";

describe("NewNamespaceAPI", () => {
	let clientMock: ApiClient;
	let api: NewNamespaceAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		api = new NewNamespaceAPI(clientMock);
	});

	it("should call client.request with correct endpoint and params", async () => {
		await api.details({ namespace_id: 123, language: "en-US" });
		expect(clientMock.request).toHaveBeenCalledWith("/new-path/123", {
			namespace_id: 123,
			language: "en-US",
		});
	});

	it("should return the result from client.request", async () => {
		const mockData = { id: 123, name: "Test" };
		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
		const result = await api.details({ namespace_id: 123 });
		expect(result).toEqual(mockData);
	});

	it("should use defaultOptions.language when no language param", async () => {
		api = new NewNamespaceAPI(clientMock, { language: "fr-FR" });
		await api.details({ namespace_id: 123 });
		expect(clientMock.request).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ language: "fr-FR" }));
	});
});
```

**Integration test file** (`<namespace>.integration.test.ts`):

```ts
import { describe, expect, it } from "vitest";
import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN environment variable is required for integration tests");

const tmdb = new TMDB(token);

describe("NewNamespaceAPI integration", () => {
	it("should return valid details", async () => {
		const result = await tmdb.new_namespace.details({ namespace_id: 123 });
		expect(result.id).toBe(123);
	});
});
```

### Step 7 — Add Documentation (Fumadocs MDX)

#### 7a — Namespace index page (`api-reference/<namespace>/index.mdx`)

````mdx
---
title: New Namespace
description: Brief description of what this API provides.
---

The `NewNamespaceAPI` provides access to ... from TMDB.

```ts
import { TMDB } from "@lorenzopant/tmdb";

const tmdb = new TMDB("your-api-key");
const result = await tmdb.new_namespace.details({ namespace_id: 123 });
```

## Methods

- [`details()`](/docs/api-reference/new-namespace/details) — Short description.
- [`images()`](/docs/api-reference/new-namespace/images) — Short description.
````

#### 7b — Method pages (`api-reference/<namespace>/<method>.mdx`)

````mdx
---
title: Details
description: Get details for a specific item by ID.
---

Short prose description of what this method returns.

```ts
async details(params: NewNamespaceDetailsParams): Promise<NewNamespaceDetail>
```

> **TMDB Reference:** [New Namespace Details](https://developer.themoviedb.org/reference/new-namespace-details)

## Parameters

| Name           | Type                                                | Required | Description                                          |
| -------------- | --------------------------------------------------- | -------- | ---------------------------------------------------- |
| `namespace_id` | `number`                                            | ✅       | TMDB identifier.                                     |
| `language`     | [`Language`](/docs/types/options/language#language) | ❌       | Language for localized results. Defaults to `en-US`. |

## Returns

[`NewNamespaceDetail`](/docs/types/new-namespace#newnamespacedetail)

## Example

```ts
const result = await tmdb.new_namespace.details({ namespace_id: 123 });
console.log(result.name);
```
````

> **CRITICAL — TypeTable rule:** When a method has parameters that include `language`, `include_image_language`, `region`, `country`, or any locale/language-related param, use `<TypeTable />` for the Parameters section **instead of** <AutoTypeTable />. Use a typescript codeblock when dealing with composite or complex types like `TVAppendToResponseNamespace` or `MovieAppendableMap`.

```mdx
import { TypeTable } from "fumadocs-ui/components/type-table";

## Parameters

<TypeTable
	type={{
		namespace_id: { type: "number", description: "TMDB identifier.", required: true },
		language: { type: "Language", description: "Language for localized results.", default: "en-US" },
		include_image_language: {
			type: "Language | LanguageISO6391",
			description: 'Include images from additional languages (e.g., `"en,null"`).',
		},
		region: { type: "CountryISO3166_1", description: "Filter results by country." },
	}}
/>
```

Use `<TypeTable />` also whenever displaying a parameter/type object with optional/default fields for clarity.

#### 7c — Types page (`types/<namespace>.mdx`)

```mdx
---
title: New Namespace
description: Type definitions for the New Namespace API.
---

import { TypeTable } from "fumadocs-ui/components/type-table";

These types represent the ... domain.

## `NewNamespaceDetail`

The complete representation as returned by [`new_namespace.details()`](/docs/api-reference/new-namespace/details).

<TypeTable
	type={{
		id: { type: "number", description: "Unique TMDB identifier." },
		name: { type: "string", description: "Localized name." },
		overview: { type: "string | null", description: "Description or synopsis." },
	}}
/>

## `NewNamespaceDetailsParams`

<TypeTable
	type={{
		namespace_id: { type: "number", description: "TMDB identifier.", required: true },
		language: { type: "Language", description: "Language for localized results.", default: "en-US" },
	}}
/>
```

---

## Key Conventions Summary

| Pattern                | Convention                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------- | --------------------- |
| API class names        | `<Domain>API` — `MoviesAPI`, `TVSeriesAPI`, `SearchAPI`                                |
| TMDB property on class | `snake_case` — `tmdb.tv_series`, `tmdb.watch_providers`                                |
| Method names           | `snake_case` matching TMDB: `alternative_titles`, `watch_providers`                    |
| Type names             | `PascalCase` — `MovieDetails`, `TVSeriesCredits`                                       |
| Params suffix          | `<Domain><Method>Params` — `MovieDetailsParams`                                        |
| URL constants          | `SCREAMING_SNAKE_CASE` in `ENDPOINTS` object                                           |
| Nullable API fields    | `field: string                                                                         | null`(not`undefined`) |
| Language fallback      | `const { language = this.defaultOptions.language, ...rest } = params;`                 |
| List/search endpoints  | Use `this.applyDefaults(params)`                                                       |
| Image endpoints        | Use `this.withLanguage(params) ?? params`                                              |
| Test imports           | Always from `"vitest"` — `beforeEach`, `describe`, `expect`, `it`, `vi`                |
| Test mock              | `clientMock.request = vi.fn()` then `mockResolvedValue()`                              |
| Doc params table       | Markdown table for simple params; `<TypeTable />` when language/region/country present |
| TypeTable import       | `import { TypeTable } from "fumadocs-ui/components/type-table";`                       |
| AutoTypeTable          | `<AutoTypeTable path="<namespace>.ts" name="TypeName" />` for shared/common types      |

---

## Anti-Patterns to Avoid

- **Do not** use `camelCase` for method names or TMDB property names on the `TMDB` class
- **Do not** repeat `language`, `page`, `region` inline in param types — compose with `WithLanguage`, `WithPage`, etc.
- **Do not** skip the TMDB API research step — response shapes differ from docs and change with query params
- **Do not** add new URL strings anywhere except `routes.ts`
- **Do not** use `undefined` in type definitions for nullable API fields — use `string | null`
- **Do not** create circular type imports between namespace type files — use `types/common/` for shared entities
- **Do not** forget to register the new API class as a `public` property in `tmdb.ts`
- **Do not** use a markdown table for Parameters when the endpoint has `language`, `include_image_language`, `region`, or `country` params — always use `<TypeTable />` in that case
