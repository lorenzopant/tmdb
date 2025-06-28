import { ApiClient } from "../client";
import { MovieResultItem } from "../types/movies";
import { PaginatedResponse } from "../types/params";
import { MOVIE_ENDPOINTS } from "./movies";
import { TMDBOptions } from "../tmdb";
import { mergeParams } from "../utils/params";

export enum MovieListEndpoints {
	NOW_PLAYING = "/now_playing",
	POPULAR = "/popular",
	TOP_RATED = "/top_rated",
	UPCOMING = "/upcoming",
}

export type MovieListParams = {
	language?: string;
	page?: number;
	region?: string;
};

export class MovieListsAPI {
	private client: ApiClient;
	private defaultOptions: TMDBOptions;

	constructor(client: ApiClient, defaultOptions: TMDBOptions = {}) {
		this.client = client;
		this.defaultOptions = defaultOptions;
	}

	/**
	 * Fetch Movie List Wrapper
	 * @param endpoint Endpoint to call
	 * @param params Params for the request (language, page, region, etc)
	 * @returns Specific to endpoint (MovieListResult)
	 */
	private fetch_movie_list(endpoint: string, params: MovieListParams = {}): Promise<PaginatedResponse<MovieResultItem>> {
		const mergedParams = { ...this.defaultOptions, ...params };
		console.log("Merged params", mergedParams);
		return this.client.request<PaginatedResponse<MovieResultItem>>(MOVIE_ENDPOINTS.MOVIE + endpoint, mergedParams);
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
