import { ENDPOINTS } from "../routes";
import { Keyword, KeywordDetailsParams, KeywordMoviesParams, MovieResultItem, PaginatedResponse } from "../types";
import { TMDBAPIBase } from "./base";

export class KeywordsAPI extends TMDBAPIBase {
	private keywordPath(keyword_id: number): string {
		return `${ENDPOINTS.KEYWORDS.DETAILS}/${keyword_id}`;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/keyword/{keyword_id}
	 *
	 * Get the details of a keyword by ID.
	 *
	 * @param keyword_id Unique identifier for the keyword
	 * @reference https://developer.themoviedb.org/reference/keyword-details
	 */
	async details(params: KeywordDetailsParams): Promise<Keyword> {
		const endpoint = this.keywordPath(params.keyword_id);
		return this.client.request<Keyword>(endpoint, params);
	}

	/**
	 * Movies
	 * GET - https://api.themoviedb.org/3/keyword/{keyword_id}/movies
	 *
	 * Get the movies associated with a keyword.
	 *
	 * @deprecated TMDB marks this endpoint as deprecated. Use discover/movie with_keywords instead.
	 * @param keyword_id Unique identifier for the keyword
	 * @param language Language for localized results
	 * @param page Page number for paginated results
	 * @param include_adult Include adult titles in results
	 * @reference https://developer.themoviedb.org/reference/keyword-movies
	 */
	async movies(params: KeywordMoviesParams): Promise<PaginatedResponse<MovieResultItem>> {
		const endpoint = `${this.keywordPath(params.keyword_id)}${ENDPOINTS.KEYWORDS.MOVIES}`;
		const requestParams = this.withLanguage(params);
		return this.client.request<PaginatedResponse<MovieResultItem>>(endpoint, requestParams);
	}
}
