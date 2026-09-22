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

## 💻 CLI

The package also ships a `tmdb` command for quick lookups from the terminal — no code required:

```bash
export TMDB_BEARER_TOKEN=your_read_access_token   # or: npx @lorenzopant/tmdb config set-token <token>

npx @lorenzopant/tmdb search inception
npx @lorenzopant/tmdb movie 27205 --append credits
npx @lorenzopant/tmdb tv top-rated
npx @lorenzopant/tmdb trending movie --week
npx @lorenzopant/tmdb discover movie --genre "science fiction" --sort rating
npx @lorenzopant/tmdb movie 550 --json | jq .title
```

Output is a readable table or detail view, or raw JSON with `--json`. The CLI is bundled separately, so the SDK itself keeps zero runtime dependencies. See the [CLI guide](https://tmdb.lorenzopant.dev/docs/getting-started/cli) for every command and option.

## 📚 Docs

The documentation site (<https://lorenzopant-tmdb-docs.vercel.app>) includes:

- **Guides**: Conceptual overviews, authentication setup, best practices, etc.
- **API Reference**: Detailed reference for every endpoint, with parameters, return types, and examples.
- **Type Documentation**: Reference for all TypeScript types used in the SDK.

## 🤖 MCP Server

The documentation site exposes a [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server, letting AI assistants (Claude, Cursor, Copilot, etc.) query the `@lorenzopant/tmdb` docs directly.

**Endpoint:** `https://tmdb.lorenzopant.dev/mcp`

### Configuration

Add the server to your MCP client config:

```json
{
	"mcpServers": {
		"tmdb-docs": {
			"url": "https://tmdb.lorenzopant.dev/mcp"
		}
	}
}
```

Once connected, your AI assistant can search and read the full SDK documentation without leaving the chat.

---

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

- [x] **CLI** — A command-line tool (e.g. `npx @lorenzopant/tmdb search "inception"`) for quick lookups from the terminal. See [💻 CLI](#-cli).
- [ ] **React utilities subpackage** (`@lorenzopant/tmdb/react`) — React hooks (e.g. `useMovieDetails`, `useDiscoverMovies`) built on top of the core client.
- [x] **Discover query builder** — A fluent, chainable builder for the `discover` endpoints to replace raw param objects. See the [Discover Query Builder guide](https://tmdb.lorenzopant.dev/docs/getting-started/discover-query-builder).

> 💡 Have a feature request? Open an issue or submit a PR!

## 🗺️ Roadmap

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
