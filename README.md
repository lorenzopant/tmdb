# 🎬 @lorenzopant/tmdb

A **TypeScript-first**, fully typed wrapper around [The Movie Database (TMDB) API](https://developer.themoviedb.org) — plus a docs site — all managed in a single monorepo.

> 📚 Full documentation & API reference:  
> <https://lorenzopant-tmdb-docs.vercel.app>

---

## 📦 Packages

This monorepo is organized into multiple packages (names and paths may vary slightly depending on your setup):

- **`@lorenzopant/tmdb`** 🚀  
  Core TypeScript SDK for the TMDB API.  
  Provides a strongly typed client with modular APIs for Movies, TV Series, Search, Lists, and more. [web:11]

- **Docs app** (`apps/docs`) 📖  
   A Fumadocs-powered documentation site deployed at:  
   <https://tmdb.lorenzopant.dev>  
  This site includes guides, API reference, and type documentation for the SDK.

The monorepo is managed with modern tooling (e.g. pnpm / Turborepo / changesets, depending on the repo configuration).

---

## 🚀 Quick Start (Library)

Install the core SDK:

```bash
npm install @lorenzopant/tmdb
# or
pnpm add @lorenzopant/tmdb
# or
yarn add @lorenzopant/tmdb
```

### 🔑 Create a client

```ts
import { TMDB } from "@lorenzopant/tmdb";

const tmdb = new TMDB(process.env.TMDB_API_KEY!, {
	language: "en-US",
	region: "US",
});
```

### 🎥 Get a movie's details

```ts
const movie = await tmdb.movies.details({ movie_id: 550 });
console.log(movie.title); // "Fight Club"
```

For full setup instructions, authentication details, and more usage examples, see:
<https://lorenzopant-tmdb-docs.vercel.app>

## ✨ Core Features

- **End-to-end TypeScript types**: Every endpoint has accurate request/response types:
- **Fully typed params** ( SearchMoviesParams , MovieDetailsParams , TVDetailsParams , etc.)
- **Fully typed responses** ( MovieDetails , TVSeriesDetails , PaginatedResponses , etc.)
- **Appendable responses**: Use  append_to_response  to get related data in a single request, with correct types for the appended data.
- **Modular API structure**: Separate namespaces for Movies, TV Series, Search, Lists, etc., each with their own methods and types.
- **Comprehensive documentation**: Auto-generated API reference with examples, plus guides and type documentation.

## 🎯 Modular API Structure

The SDK is organized into modular namespaces that mirror TMDB's API structure. Each namespace contains methods corresponding to TMDB endpoints, with appropriate parameters and return types.
You can instantiate single API modules or use the full client for all features. Available namespaces include:

- `tmdb.movies` - Movie-related endpoints (details, credits, images, etc.)
- `tmdb.people` - Person-related endpoints (details, credits, images, translations, and external IDs)
- `tmdb.tv_series` - TV series endpoints (details, credits, episode groups, etc.)
- `tmdb.search` - Search endpoints for movies, TV shows, people, etc.
- `tmdb.lists` - User-created lists and TMDB-curated lists.
- `tmdb.genres` - Movie and TV genres.
- and more...

## 📚 Docs

The documentation site (<https://lorenzopant-tmdb-docs.vercel.app>) includes:

- **Guides**: Conceptual overviews, authentication setup, best practices, etc.
- **API Reference**: Detailed reference for every endpoint, with parameters, return types, and examples.
- **Type Documentation**: Reference for all TypeScript types used in the SDK.

## 🤝 Contributing

Contributions are welcome! Please see the CONTRIBUTING.md file for guidelines on how to contribute to this project, including code style, testing, and documentation standards.
This repo requires `Node.js 20+` (see root `package.json` `engines` and `.nvmrc`).
To setup the development environment, run:

```bash
pnpm install
pnpm dev
```

This will start the development server for the documentation site, where you can view your changes in real-time at <http://localhost:3000>.

**Please make sure** to set up your environment variables (e.g., TMDB API key) before running `pnpm dev`.

### 🧪 Tests

Be sure to run tests before submitting a pull request, or add new tests if you're adding features or fixing bugs. To run the test suite, use:

```bash
pnpm test
```

and also make sure you're compliant with the linting rules:

```bash
pnpm lint
```

## 🚀 Planned Features

The following features are planned to improve developer experience and extend the wrapper's capabilities.

### 🔧 Request & Response Layer

- [x] **Logger** — Log method name, URL, params, response status, and latency with optionally custom log functions
- [x] **Request interceptors** — Hook into every request before it fires (e.g., inject custom headers, modify params)
- [x] **Response interceptors** — Transform or inspect every response globally before it reaches the caller
- [x] **Automatic retry with backoff** — Retry failed requests (e.g., `429 Too Many Requests` or `5xx`) with configurable max retries and exponential backoff

### ⚡ Performance

- [x] **In-memory caching** — Cache GET responses by URL + params with a configurable TTL (TMDB data like genres or configurations rarely changes)
- [x] **Request deduplication** — Reuse in-flight Promises for identical concurrent requests instead of firing duplicates
- [x] **Rate limiter** — Automatically queue requests to stay within TMDB's API rate limits (~40 requests per second)

### 🛠️ Developer Ergonomics

- [x] **Pagination helpers** — Expose an `autoPaginate()` utility or async generator that fetches all pages transparently
- [x] **Image URL builder** — Helper to resolve TMDB image paths into full URLs (e.g., `tmdb.images.poster(path, "w500")`)
- [x] **Language/region defaults** — Set `language` and `region` once at the client level instead of passing them on every call
- [x] **Typed errors** — Structured `TMDBError` objects with `statusCode`, `statusMessage`, and original request context instead of raw HTTP errors
- [x] **Image URL auto-enrichment** — Automatically convert image path fields (e.g., `poster_path`) into full URLs in responses

> 💡 Have a feature request? Open an issue or submit a PR!

## 🗺️ Roadmap

Planned features and improvements include:

- Additional API endpoints and namespaces (e.g., People, Collections, etc.)
- More comprehensive examples and guides in the documentation.
- Performance optimizations and caching strategies.
- Community contributions and feedback-driven improvements.

| API Endpoint      | Status |
| ----------------- | ------ |
| Account           | ✅     |
| Authentication    | ✅     |
| Certifications    | ✅     |
| Changes           | ✅     |
| Collections       | ✅     |
| Companies         | ✅     |
| Configuration     | ✅     |
| Credits           | ✅     |
| Discover          | ✅     |
| Find              | ✅     |
| Genres            | ✅     |
| Guest Sessions    | ✅     |
| Keywords          | ✅     |
| Lists             | ✅     |
| Movie Lists       | ✅     |
| Movies            | ✅     |
| Networks          | ✅     |
| People Lists      | ✅     |
| People            | ✅     |
| Reviews           | ✅     |
| Search            | ✅     |
| Trending          | ✅     |
| TV Series Lists   | ✅     |
| TV Series         | ✅     |
| TV Seasons        | ✅     |
| TV Episodes       | ✅     |
| TV Episode Groups | ✅     |
| Watch Providers   | ✅     |
