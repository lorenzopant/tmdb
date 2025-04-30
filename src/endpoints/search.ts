import { ApiClient } from "../client";
import { MovieResultItem } from "../types/movies";
import { PaginatedResponse } from "../types/params";

export const SEARCH_ENDPOINTS = {
	MOVIE: "/search/movie",
};

export class SearchAPI {
	private client: ApiClient;

	constructor(client: ApiClient) {
		this.client = client;
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
	async search(
		query: string,
		include_adult: boolean = false,
		language: string = "en-US",
		page: number = 1,
		primary_release_year?: string,
		region?: string,
		year?: string
	): Promise<PaginatedResponse<MovieResultItem>> {
		const params: Record<string, number | string | boolean | undefined> = {
			query,
			include_adult,
			language,
			page,
			primary_release_year,
			year,
			region,
		};
		const endpoint = `${SEARCH_ENDPOINTS.MOVIE}`;
		return this.client.request<PaginatedResponse<MovieResultItem>>(endpoint, params);
	}
}
