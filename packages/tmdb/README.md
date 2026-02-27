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
yard add @lorenzopant/tmdb
```

---

## Usage

```typescript
import { TMDB } from '@lorenzopant/tmdb';

const tmdb = new TMDB('your_access_token');

async function searchMovies() {
  try {
    const movies = await tmdb.search.movies({ query: 'Fight Club' });
    console.log(movies);
  } catch (error) {
    if (error instanceof TMDBError) {
      console.error('TMDB Error:', error.message);
      console.error('HTTP Status:', error.http_status_code);
      console.error('TMDB Status Code:', error.tmdb_status_code);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

searchMovies();
```

---

## API

### `TMDB`

The main client class. **Each API method supports all the parameters supported by TMDB API**, for example the search method supports: query, language, region, year, primary_release_year and so on...

#### Constructor

```typescript
const tmdb = new TMDB(accessToken: string);
```

- `accessToken`: **required**. Your TMDB API v4 access token.

---

### `Search`

Search for movies:

```typescript
tmdb.search.movies({ query: "Fight Club" });
```

Returns a **typed response** containing movies.

---

### `Movie Lists`

Now Playing, Popular, Top Rated and Upcoming movies:

```typescript
tmdb.movie_lists.now_playing();
tmdb.movie_lists.top_rated();
tmdb.movie_lists.popular();
tmdb.movie_lists.upcoming();
```

Returns a **typed response** containing movies.

---

### `Movie`

Details, alternative titles, changes, credits, external IDs and more:

```typescript
tmdb.movie.details({ movie_id: 550 });
tmdb.movie.alternative_titles({ movie_id: 550 });
tmdb.movie.changes({ movie_id: 550 });
tmdb.movie.credits({ movie_id: 550 });
tmdb.movie.external_ids({ movie_id: 550 });

...and more
```

Returns a **typed response** containing movies.

---

## Requirements

- Node.js 18+ recommended
- Works on frontend (React, Vue) but **don't expose sensitive access tokens** to users!

---

## License

MIT
