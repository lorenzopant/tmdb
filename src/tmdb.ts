// src.tmdb.ts

import { ApiClient } from "./client";
import { MovieListsAPI } from "./endpoints/movie_lists";
import { MoviesAPI } from "./endpoints/movies";
import { SearchAPI } from "./endpoints/search";
import { Errors } from "./errors/messages";

export class TMDB {
	private client: ApiClient;
	public movies: MoviesAPI;
	public movie_lists: MovieListsAPI;
	public search: SearchAPI;
	// etc...

	constructor(accessToken: string) {
		if (!accessToken) throw new Error(Errors.NO_ACCESS_TOKEN);
		this.client = new ApiClient(accessToken);
		this.movies = new MoviesAPI(this.client);
		this.movie_lists = new MovieListsAPI(this.client);
		this.search = new SearchAPI(this.client);
	}
}
