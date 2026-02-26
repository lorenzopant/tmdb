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
   <https://lorenzopant-tmdb-docs.vercel.app>  
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

## 🗺️ Roadmap

Planned features and improvements include:

- Additional API endpoints and namespaces (e.g., People, Collections, etc.)
- More comprehensive examples and guides in the documentation.
- Performance optimizations and caching strategies.
- Community contributions and feedback-driven improvements.
