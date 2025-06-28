// src.tmdb.ts

import { ApiClient } from "./client";
import { MovieListsAPI } from "./endpoints/movie_lists";
import { MoviesAPI } from "./endpoints/movies";
import { SearchAPI } from "./endpoints/search";
import { Errors } from "./errors/messages";

export type TMDBOptions = {
	// ** The language to use for requests (ISO 639-1 code)
	language?: string;
	// ** The region to use for requests
	region?: string;
	// ** The country to use for requests
	country?: string;
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
		this.movies = new MoviesAPI(this.client, options);
		this.movie_lists = new MovieListsAPI(this.client, options);
		this.search = new SearchAPI(this.client, options);
	}

	/**
	 * Helper to merge default options with method-specific params.
	 * Method-level params override defaults.
	 */
	public withDefaults<T extends object>(params?: T): T & TMDBOptions {
		return { ...(this.options as object), ...(params as object) } as T & TMDBOptions;
	}
}
