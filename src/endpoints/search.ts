import { SearchCollectionItem } from "../types/collections";
import { SearchCompanyItem, SearchCompanyParams } from "../types/companies";
import { SearchKeywordItem, SearchKeywordsParams } from "../types/keywords";
import { MovieResultItem } from "../types/movies";
import { PaginatedResponse, SearchCollectionsParams, SearchMoviesParams } from "../types/params";
import { TMDBAPIBase } from "./base";

export const SEARCH_ENDPOINTS = {
	MOVIE: "/search/movie",
	COLLECTION: "/search/collection",
	COMPANY: "/search/company",
	KEYWORK: "/search/keyword",
	MULTI: "/search/multi",
	PERSON: "/search/person",
	TV: "/search/tv",
};

export class SearchAPI extends TMDBAPIBase {
	/**
	 * Search Collection
	 * GET - https://api.themoviedb.org/3/search/collection
	 *
	 * Search for collections by their original, translated and alternative names.
	 * @param query Search query (required)
	 * @param include_adult Include Adult (Defaults to false)
	 * @param language Language (Defaults to en-US)
	 * @param page Page (Defaults to 1)
	 * @param region Region
	 * @reference https://developer.themoviedb.org/reference/search-collection
	 */
	async collections(params: SearchCollectionsParams): Promise<PaginatedResponse<SearchCollectionItem>> {
		const endpoint = `${SEARCH_ENDPOINTS.COLLECTION}`;
		return this.client.request<PaginatedResponse<SearchCollectionItem>>(endpoint, this.applyDefaults(params));
	}

	/**
	 * Search Movies
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
		return this.client.request<PaginatedResponse<MovieResultItem>>(endpoint, this.applyDefaults(params));
	}

	/**
	 * Search Company
	 * GET - https://api.themoviedb.org/3/search/company
	 *
	 * Search for companies by their original and alternative names.
	 * @param query Search query (required)
	 * @param page Page (Defaults to 1)
	 * @reference https://developer.themoviedb.org/reference/search-company
	 */
	async company(params: SearchCompanyParams): Promise<PaginatedResponse<SearchCompanyItem>> {
		const endpoint = `${SEARCH_ENDPOINTS.COMPANY}`;
		return this.client.request<PaginatedResponse<SearchCompanyItem>>(endpoint, this.applyDefaults(params));
	}

	/**
	 * Search Keyword
	 * GET - https://api.themoviedb.org/3/search/keyword
	 *
	 * Search for keywords by their name.
	 * @param query Search query (required)
	 * @param page Page (Defaults to 1)
	 * @reference https://developer.themoviedb.org/reference/search-keyword
	 */
	async keyword(params: SearchKeywordsParams): Promise<PaginatedResponse<SearchKeywordItem>> {
		const endpoint = `${SEARCH_ENDPOINTS.COMPANY}`;
		return this.client.request<PaginatedResponse<SearchKeywordItem>>(endpoint, this.applyDefaults(params));
	}
}
