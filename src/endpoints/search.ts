import { ApiClient } from "../client";
import { MovieResultItem } from "../types/movies";
import { PaginatedResponse, SearchMoviesParams } from "../types/params";
import { TMDBOptions } from "../tmdb";
import { mergeParams } from "../utils/params";

export const SEARCH_ENDPOINTS = {
	MOVIE: "/search/movie",
};

export class SearchAPI {
	private client: ApiClient;
	private defaultOptions: TMDBOptions; // ** Default options for all requests

	constructor(client: ApiClient, defaultOptions: TMDBOptions = {}) {
		this.client = client;
		this.defaultOptions = defaultOptions;
	}

	/**
	 * Search
	 * GET - https://api.themoviedb.org/3/search/movie
	 *
	 * Search for movies by their original, translated and alternative titles.
	 * @param query Search query (required)
	 * @param include_adult Include Adult (Defaults to false)
	 * @param language Language (Defaults to en-US)
	 * @param primary_release_year: string
	 * @param page Page (Defaults to 1)
	 * @param region Region
	 * @param year Year
	 * @reference https://developer.themoviedb.org/reference/search-movie
	 */
	async movies(params: SearchMoviesParams): Promise<PaginatedResponse<MovieResultItem>> {
		const endpoint = `${SEARCH_ENDPOINTS.MOVIE}`;
		// Merge defaultOptions with params, giving precedence to params
		const mergedParams = { ...this.defaultOptions, ...params };
		console.log("Params", mergedParams);
		return this.client.request<PaginatedResponse<MovieResultItem>>(endpoint, mergedParams);
	}
}
