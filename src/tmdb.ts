// src.tmdb.ts

import { ApiClient } from "./client";
import { ConfigurationAPI } from "./endpoints/configuration";
import { GenresAPI } from "./endpoints/genres";
import { MovieListsAPI } from "./endpoints/movie_lists";
import { MoviesAPI } from "./endpoints/movies";
import { SearchAPI } from "./endpoints/search";
import { Errors } from "./errors/messages";
import { ImageAPI } from "./images/images";
import { TMDBOptions } from "./types";

export class TMDB {
	private client: ApiClient;
	private options: TMDBOptions; // ** Default options for all requests
	public movies: MoviesAPI;
	public movie_lists: MovieListsAPI;
	public search: SearchAPI;
	public images: ImageAPI;
	public config: ConfigurationAPI;
	public genres: GenresAPI;
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
		this.images = new ImageAPI(this.options.images);
		this.config = new ConfigurationAPI(this.client, this.options);
		this.genres = new GenresAPI(this.client, this.options);
	}
}
