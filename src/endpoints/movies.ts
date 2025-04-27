import { ApiClient } from "../client";
import { MovieDetails } from "../types/movies";

export const MOVIE_ENDPOINTS = {
	MOVIE: "/movie",
};

export class MoviesAPI {
	private client: ApiClient;

	constructor(client: ApiClient) {
		this.client = client;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}
	 *
	 * Get the top level details of a movie by ID.
	 * @reference https://developer.themoviedb.org/reference/movie-details
	 */
	async details(movie_id: number, append_to_response?: string[], language?: string): Promise<MovieDetails> {
		const params: Record<string, string | string[] | undefined> = { append_to_response, language };
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${movie_id}`;
		return this.client.request<MovieDetails>(endpoint, params);
	}
}
