import { ApiClient } from "../client";
import { PaginatedResponse } from "../types";
import { TMDBOptions } from "../types/config";
import { MovieListParams, MovieResultItem } from "../types/movies";

import { MOVIE_ENDPOINTS } from "./movies";

export enum MovieListEndpoints {
	NOW_PLAYING = "/now_playing",
	POPULAR = "/popular",
	TOP_RATED = "/top_rated",
	UPCOMING = "/upcoming",
}

export class MovieListsAPI {
	private client: ApiClient;
	private defaultOptions: TMDBOptions;

	constructor(client: ApiClient, defaultOptions: TMDBOptions = {}) {
		this.client = client;
		this.defaultOptions = defaultOptions;
	}

	private withDefaults(params: MovieListParams): MovieListParams {
		const { language = this.defaultOptions.language, region = this.defaultOptions.region, ...rest } = params;
		return { language, region, ...rest };
	}

	/**
	 * Fetch Movie List Wrapper
	 * @param endpoint Endpoint to call
	 * @param params Params for the request (language, page, region, etc)
	 * @returns Specific to endpoint (MovieListResult)
	 */
	private fetch_movie_list(endpoint: string, params: MovieListParams = {}): Promise<PaginatedResponse<MovieResultItem>> {
		return this.client.request<PaginatedResponse<MovieResultItem>>(MOVIE_ENDPOINTS.MOVIE + endpoint, this.withDefaults(params));
	}

	/**
	 * Now Playing
	 * GET - https://api.themoviedb.org/3/movie/now_playing
	 *
	 * Get a list of movies that are currently in theatres.
	 * @param language Language (Defaults to en-US or TMDB default)
	 * @param page Page (Defaults to 1)
	 * @param region ISO-3166-1 code
	 */
	async now_playing(params: MovieListParams = {}): Promise<PaginatedResponse<MovieResultItem>> {
		return this.fetch_movie_list(MovieListEndpoints.NOW_PLAYING, params);
	}

	/**
	 * Popular
	 * GET - https://api.themoviedb.org/3/movie/popular
	 *
	 * Get a list of movies ordered by popularity.
	 * @param language Language (Defaults to en-US or TMDB default)
	 * @param page Page (Defaults to 1)
	 * @param region ISO-3166-1 code
	 */
	async popular(params: MovieListParams = {}): Promise<PaginatedResponse<MovieResultItem>> {
		return this.fetch_movie_list(MovieListEndpoints.POPULAR, params);
	}

	/**
	 * Top Rated
	 * GET - https://api.themoviedb.org/3/movie/top_rated
	 *
	 * Get a list of movies ordered by rating.
	 * @param language Language (Defaults to en-US or TMDB default)
	 * @param page Page (Defaults to 1)
	 * @param region ISO-3166-1 code
	 */
	async top_rated(params: MovieListParams = {}): Promise<PaginatedResponse<MovieResultItem>> {
		return this.fetch_movie_list(MovieListEndpoints.TOP_RATED, params);
	}

	/**
	 * Upcoming
	 * GET - https://api.themoviedb.org/3/movie/upcoming
	 *
	 * Get a list of movies that are being released soon.
	 * @param language Language (Defaults to en-US or TMDB default)
	 * @param page Page (Defaults to 1)
	 * @param region ISO-3166-1 code
	 */
	async upcoming(params: MovieListParams = {}): Promise<PaginatedResponse<MovieResultItem>> {
		return this.fetch_movie_list(MovieListEndpoints.UPCOMING, params);
	}
}
