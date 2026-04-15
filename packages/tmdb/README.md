# 🍿 @lorenzopant/tmdb

A **TypeScript-first** lightweight client for [The Movie Database (TMDB)](https://developer.themoviedb.org/docs/getting-started) API.

This package is open-source and will be updated regularly with new features.
Feel free to open pull requests on the project repository.

- 📦 Full TypeScript support
- 🔥 Simple and tiny wrapper
- 🚀 Designed for server-side and frontend use (NextJS, React, Vue, etc.)

## Full documentation is available at [@lorenzopant/tmdb](https://lorenzopant-tmdb-docs.vercel.app)

---

## Installation

```bash
npm install @lorenzopant/tmdb
// or
pnpm add @lorenzopant/tmdb
// or
yarn add @lorenzopant/tmdb
```

---

## Quick Start

```typescript
import { TMDB, TMDBError } from "@lorenzopant/tmdb";

const tmdb = new TMDB(process.env.TMDB_ACCESS_TOKEN!);

const movie = await tmdb.movies.details({ movie_id: 550 });
console.log(movie.title); // "Fight Club"
```

---

## Namespaces

Every namespace maps directly to a TMDB API section. All methods are fully typed.

| Namespace                | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `tmdb.movies`            | Movie details, credits, images, videos, recommendations, and more |
| `tmdb.movie_lists`       | Now Playing, Popular, Top Rated, Upcoming                         |
| `tmdb.tv_series`         | TV series details, credits, seasons, episode groups               |
| `tmdb.tv_lists`          | Airing Today, On The Air, Popular, Top Rated TV                   |
| `tmdb.tv_seasons`        | Season details, credits, images                                   |
| `tmdb.tv_episodes`       | Episode details, credits, images                                  |
| `tmdb.tv_episode_groups` | Episode group details                                             |
| `tmdb.search`            | Search movies, TV shows, people, collections, keywords            |
| `tmdb.discover`          | Discover movies and TV shows by filter                            |
| `tmdb.trending`          | Trending movies, TV, and people                                   |
| `tmdb.people`            | Person details, credits, images, translations                     |
| `tmdb.people_lists`      | Popular people                                                    |
| `tmdb.collections`       | Collection details and images                                     |
| `tmdb.companies`         | Company details, alternative names, images                        |
| `tmdb.credits`           | Credit details                                                    |
| `tmdb.genres`            | Movie and TV genre lists                                          |
| `tmdb.keywords`          | Keyword details and associated movies                             |
| `tmdb.certifications`    | Movie and TV certifications per region                            |
| `tmdb.changes`           | Recent content changes                                            |
| `tmdb.configuration`     | TMDB configuration, countries, languages, timezones               |
| `tmdb.find`              | Find resources by external ID (IMDb, TVDB, etc.)                  |
| `tmdb.networks`          | TV network details                                                |
| `tmdb.watch_providers`   | Watch providers by region                                         |
| `tmdb.lists`             | User-created list management                                      |
| `tmdb.account`           | Account details and user lists                                    |
| `tmdb.authentication`    | Token-based authentication flows                                  |
| `tmdb.guest_sessions`    | Guest session rated movies/TV/episodes                            |
| `tmdb.reviews`           | Review details                                                    |
| `tmdb.images`            | Image URL builder (see below)                                     |
| `tmdb.v4`                | TMDB API v4 (auth, account, lists — requires JWT)                 |

---

## Constructor Options

```typescript
const tmdb = new TMDB(accessToken, {
	language: "en-US", // ISO 639-1: default language for all requests
	region: "US", // ISO 3166-1: default region for all requests
	timezone: "America/New_York", // default timezone for TV airing queries
	logger: true, // enable built-in request/response logging
	deduplication: true, // deduplicate concurrent identical requests (default: true)
	rate_limit: true, // auto-queue requests to stay within TMDB rate limits
	cache: true, // enable in-memory TTL-based response caching
	images: {
		secure_images_url: true,
		default_image_sizes: { posters: "w500", backdrops: "w780" },
	},
});
```

### `logger`

```typescript
// Built-in console logger
const tmdb = new TMDB(token, { logger: true });

// Custom logger function
const tmdb = new TMDB(token, {
	logger: (entry) => {
		if (entry.type === "response") {
			console.log(`[TMDB] ${entry.endpoint} → ${entry.status} (${entry.durationMs}ms)`);
		}
	},
});
```

### `rate_limit`

Automatically queues requests to stay within TMDB's API limits (~40 req/s). Useful for bulk scripts.

```typescript
// Default limits
const tmdb = new TMDB(token, { rate_limit: true });

// Custom budget
const tmdb = new TMDB(token, { rate_limit: { max_requests: 30, per_ms: 1_000 } });
```

### `cache`

In-memory TTL-based caching for GET requests. Entries expire lazily on access.

```typescript
// 5-minute TTL, no size limit (defaults)
const tmdb = new TMDB(token, { cache: true });

// Custom TTL and bounded size
const tmdb = new TMDB(token, {
	cache: {
		ttl: 60_000, // 60 seconds
		max_size: 500, // evict oldest entry when limit is reached
		excluded_endpoints: ["/trending", /\/discover\//],
	},
});

// Runtime cache controls
tmdb.cache?.invalidate("/movie/now_playing"); // remove one entry
tmdb.cache?.clear(); // remove all entries
console.log(tmdb.cache?.size); // number of cached entries
```

### `interceptors`

Hook into every request or response globally.

```typescript
const tmdb = new TMDB(token, {
	interceptors: {
		request: (ctx) => {
			// Inject a param into every request
			return { ...ctx, params: { ...ctx.params, include_adult: false } };
		},
		response: {
			onSuccess: (data) => {
				myAnalytics.track("tmdb_response", data);
			},
			onError: (error) => {
				Sentry.captureException(error);
			},
		},
	},
});
```

---

## Examples

### Movie details

```typescript
const movie = await tmdb.movies.details({ movie_id: 550 });
console.log(movie.title); // "Fight Club"
console.log(movie.release_date); // "1999-10-15"
```

### `append_to_response` — typed overloads

Fetch related data in a single request. The return type is automatically extended with the appended fields.

```typescript
const movie = await tmdb.movies.details({
	movie_id: 550,
	append_to_response: ["credits", "videos"],
});

// TypeScript knows these are present:
console.log(movie.credits.cast[0].name);
console.log(movie.videos.results[0].key);
```

### Search

```typescript
const results = await tmdb.search.movies({ query: "Inception", language: "en-US" });
console.log(results.results[0].title); // "Inception"
```

### TV series

```typescript
const show = await tmdb.tv_series.details({ series_id: 1396 });
console.log(show.name); // "Breaking Bad"

const season = await tmdb.tv_seasons.details({ series_id: 1396, season_number: 1 });
console.log(season.episodes.length);
```

### Discover

```typescript
const action = await tmdb.discover.movies({
	with_genres: "28",
	sort_by: "vote_average.desc",
	"vote_count.gte": 1000,
});
```

### Trending

```typescript
const trending = await tmdb.trending.movies({ time_window: "week" });
```

### Image URLs

```typescript
const movie = await tmdb.movies.details({ movie_id: 550 });

// Build a full URL from a path
const posterUrl = tmdb.images.poster(movie.poster_path!, "w500");
const backdropUrl = tmdb.images.backdrop(movie.backdrop_path!, "w1280");

// Or enable auto-enrichment so all image paths in every response are resolved automatically
const tmdb = new TMDB(token, {
	images: { autocomplete_images: true, secure_images_url: true },
});
```

### Error handling

```typescript
import { TMDB, TMDBError } from "@lorenzopant/tmdb";

try {
	const movie = await tmdb.movies.details({ movie_id: 0 });
} catch (error) {
	if (error instanceof TMDBError) {
		console.error(error.message); // human-readable message
		console.error(error.http_status_code); // e.g. 404
		console.error(error.tmdb_status_code); // TMDB-specific status code
	}
}
```

### TMDB API v4 (requires JWT access token)

```typescript
const tmdb = new TMDB(jwtAccessToken);

const lists = await tmdb.v4.lists.list({ account_id: "me" });
```

---

## Requirements

- Node.js 20+
- Works in frontend frameworks (React, Vue, Next.js) — **never expose your access token to the browser in production**

---

## License

MIT
