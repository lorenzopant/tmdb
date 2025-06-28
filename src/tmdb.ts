// src.tmdb.ts

import { ApiClient } from "./client";
import { MovieListsAPI } from "./endpoints/movie_lists";
import { MoviesAPI } from "./endpoints/movies";
import { SearchAPI } from "./endpoints/search";
import { Errors } from "./errors/messages";
import { CountryISO3166_1 } from "./types/countries";
import { LanguageISO6391 } from "./types/lang";

export type TMDBOptions = {
	/**
	 * The language to use for requests (ISO 639-1 code)
	 * This provides localization and translated data.
	 */
	language?: LanguageISO6391;
	/**
	 * Region codes follow ISO 3166-1 (e.g. 'US', 'IT', 'JP') and are used to localize results.
	 * They affect release dates, age certifications, watch providers, and filtered movie lists.
	 * Example: 'region=IT' returns Italian-specific results for now playing, watch providers, etc.
	 * If not set, TMDB may fall back to a default or global data.
	 */
	region?: CountryISO3166_1;
};

export class TMDB {
	private client: ApiClient;
	private options: TMDBOptions; // ** Default options for all requests
	public movies: MoviesAPI;
	public movie_lists: MovieListsAPI;
	public search: SearchAPI;
	// etc...

	/**
	 * Creates a new TMDB instance.
	 * @param accessToken The TMDB API access token.
	 * @param options Optional default options (e.g., language) for all requests.
	 */
	constructor(accessToken: string, options: TMDBOptions = {}) {
		if (!accessToken) throw new Error(Errors.NO_ACCESS_TOKEN);
		this.options = options;
		this.client = new ApiClient(accessToken);
		this.movies = new MoviesAPI(this.client, this.options);
		this.movie_lists = new MovieListsAPI(this.client, this.options);
		this.search = new SearchAPI(this.client, this.options);
	}
}
