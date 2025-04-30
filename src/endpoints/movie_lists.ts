import { ApiClient } from "../client";
import { MovieResultItem } from "../types/movies";
import { PaginatedResponse } from "../types/params";
import { MOVIE_ENDPOINTS } from "./movies";

const MOVIE_LISTS_ENDPOINTS = {
	NOW_PLAYING: "/now_playing",
	POPULAR: "/popular",
	TOP_RATED: "/top_rated",
	UPCOMING: "/upcoming",
};

export class MovieListsAPI {
	private client: ApiClient;

	constructor(client: ApiClient) {
		this.client = client;
	}

	/**
	 * Fetch Movie List Wrapper
	 * @param endpoint Endpoint to call
	 * @param language Language (Defaults to en-US)
	 * @param page Page (Defaults to 1)
	 * @param region ISO-3166-1 code
	 * @returns Specific to endpoint (MovieListResult)
	 */
	private fetch_movie_list(
		endpoint: string,
		language: string,
		page: number,
		region?: string
	): Promise<PaginatedResponse<MovieResultItem>> {
		const params: Record<string, string | number | undefined> = { page, language, region };
		return this.client.request<PaginatedResponse<MovieResultItem>>(MOVIE_ENDPOINTS.MOVIE + endpoint, params);
	}

	/**
	 * Now Playing
	 * GET - https://api.themoviedb.org/3/movie/now_playing
	 *
	 * Get a list of movies that are currently in theatres.
	 * @param language Language (Defaults to en-US)
	 * @param page Page (Defaults to 1)
	 * @param region ISO-3166-1 code
	 */
	async now_playing(language: string = "en-US", page: number = 1, region?: string): Promise<PaginatedResponse<MovieResultItem>> {
		return this.fetch_movie_list(MOVIE_LISTS_ENDPOINTS.NOW_PLAYING, language, page, region);
	}

	/**
	 * Popular
	 * GET - https://api.themoviedb.org/3/movie/popular
	 *
	 * Get a list of movies ordered by popularity.
	 * @param language Language (Defaults to en-US)
	 * @param page Page (Defaults to 1)
	 * @param region ISO-3166-1 code
	 */
	async popular(language: string = "en-US", page: number = 1, region?: string): Promise<PaginatedResponse<MovieResultItem>> {
		return this.fetch_movie_list(MOVIE_LISTS_ENDPOINTS.POPULAR, language, page, region);
	}

	/**
	 * Top Rated
	 * GET - https://api.themoviedb.org/3/movie/top_rated
	 *
	 * Get a list of movies ordered by rating.
	 * @param language Language (Defaults to en-US)
	 * @param page Page (Defaults to 1)
	 * @param region ISO-3166-1 code
	 */
	async top_rated(language: string = "en-US", page: number = 1, region?: string): Promise<PaginatedResponse<MovieResultItem>> {
		return this.fetch_movie_list(MOVIE_LISTS_ENDPOINTS.TOP_RATED, language, page, region);
	}

	/**
	 * Upcoming
	 * GET - https://api.themoviedb.org/3/movie/upcoming
	 *
	 * Get a list of movies that are being released soon.
	 * @param language Language (Defaults to en-US)
	 * @param page Page (Defaults to 1)
	 * @param region ISO-3166-1 code
	 */
	async upcoming(language: string = "en-US", page: number = 1, region?: string): Promise<PaginatedResponse<MovieResultItem>> {
		return this.fetch_movie_list(MOVIE_LISTS_ENDPOINTS.UPCOMING, language, page, region);
	}
}
