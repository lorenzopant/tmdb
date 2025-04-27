// src.tmdb.ts

import { ApiClient } from "./client";
import { MoviesAPI } from "./endpoints/movies";
import { Errors } from "./errors/messages";

export class TMDB {
	private client: ApiClient;
	public movies: MoviesAPI;
	// public search: SearchAPI;
	// etc...

	constructor(accessToken: string) {
		if (!accessToken) throw new Error(Errors.NO_ACCESS_TOKEN);
		this.client = new ApiClient(accessToken);
		this.movies = new MoviesAPI(this.client);
	}
}
