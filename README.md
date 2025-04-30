# TMDB API TS

A **TypeScript-first** lightweight client for [The Movie Database (TMDB)](https://developer.themoviedb.org/docs/getting-started) API.

🚧🚧🚧🚧🚧🚧 **WIP** This package is still cookin. It will be updated regularly with new features.
Feel free to open pull requests on the project repository here:
[tmdb-api-ts](https://github.com/lorenzopantano/tmdb-api-ts)

- 📦 Full TypeScript support
- 🔥 Simple and tiny wrapper
- 🚀 Designed for server-side and frontend use (React, Vue, etc.)
- 🛡️ Proper error handling with `TMDBError`

---

## Installation

```bash
npm install tmdb-api-ts
```

or

```bash
yarn add tmdb-api-ts
```

---

## Usage

```typescript
import { TMDB } from 'tmdb-api-ts';

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
tmdb.search.movies("Fight Club");
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

Now Playing, Popular, Top Rated and Upcoming movies:

```typescript
tmdb.movie.details(550);
tmdb.movie.alternative_titles(550);
tmdb.movie.changes(550);
tmdb.movie.credits(550);
tmdb.movie.external_ids(550);

...
```

Returns a **typed response** containing movies.

---

## Error Handling

All errors thrown from the TMDB API are wrapped in a `TMDBError` class.

You can catch them:

```typescript
catch (error) {
  if (error instanceof TMDBError) {
    console.log(error.message);
    console.log(error.http_status_code);
    console.log(error.tmdb_status_code);
  }
}
```

Properties available:

- `message`
- `http_status_code`
- `tmdb_status_code`

If the TMDB service is unreachable or returns unexpected errors, `tmdb_status_code` is set to `-1`.

---

## Requirements

- Node.js 18+ recommended
- Works on frontend (React, Vue) but **don't expose sensitive access tokens** to users!

---

## License

MIT
