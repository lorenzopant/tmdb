import {
	CollectionResultItem,
	CompanyResultItem,
	KeywordResultItem,
	MovieResultItem,
	MultiSearchResultItem,
	PaginatedResponse,
	PersonResultItem,
	SearchCollectionsParams,
	SearchCompanyParams,
	SearchKeywordsParams,
	SearchMoviesParams,
	SearchMultiParams,
	SearchPersonParams,
	SearchTVSeriesParams,
	TVSeriesResultItem,
} from "../types";
import { ENDPOINTS } from "../routes";
import { TMDBAPIBase } from "./base";

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
	async collections(params: SearchCollectionsParams): Promise<PaginatedResponse<CollectionResultItem>> {
		return this.client.request<PaginatedResponse<CollectionResultItem>>(ENDPOINTS.SEARCH.COLLECTION, this.applyDefaults(params));
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
		return this.client.request<PaginatedResponse<MovieResultItem>>(ENDPOINTS.SEARCH.MOVIE, this.applyDefaults(params));
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
	async company(params: SearchCompanyParams): Promise<PaginatedResponse<CompanyResultItem>> {
		return this.client.request<PaginatedResponse<CompanyResultItem>>(ENDPOINTS.SEARCH.COMPANY, this.applyDefaults(params));
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
	async keyword(params: SearchKeywordsParams): Promise<PaginatedResponse<KeywordResultItem>> {
		return this.client.request<PaginatedResponse<KeywordResultItem>>(ENDPOINTS.SEARCH.KEYWORD, this.applyDefaults(params));
	}

	/**
	 * Search Person
	 * GET - https://api.themoviedb.org/3/search/person
	 *
	 * Search for people by their name and also known as names.
	 * @param query Search query (required)
	 * @param page Page (Defaults to 1)
	 * @reference https://developer.themoviedb.org/reference/search-person
	 */
	async person(params: SearchPersonParams): Promise<PaginatedResponse<PersonResultItem>> {
		return this.client.request<PaginatedResponse<PersonResultItem>>(ENDPOINTS.SEARCH.PERSON, this.applyDefaults(params));
	}

	/**
	 * Search TV Series
	 * GET - https://api.themoviedb.org/3/search/tv
	 *
	 * Search for TV shows by their original, translated and also known as names.
	 * @param query Search query (required)
	 * @param include_adult Include Adult (Defaults to false)
	 * @param language Language (Defaults to en-US)
	 * @param page Page (Defaults to 1)
	 * @param first_air_date_year Filter by first air date year
	 * @param year Filter by any air date year (including episodes)
	 * @reference https://developer.themoviedb.org/reference/search-tv
	 */
	async tv_series(params: SearchTVSeriesParams): Promise<PaginatedResponse<TVSeriesResultItem>> {
		return this.client.request<PaginatedResponse<TVSeriesResultItem>>(ENDPOINTS.SEARCH.TV, this.applyDefaults(params));
	}

	/**
	 * Search Multi
	 * GET - https://api.themoviedb.org/3/search/multi
	 *
	 * Search for movies, TV shows, and people in a single request.
	 * @param query Search query (required)
	 * @param include_adult Include Adult (Defaults to false)
	 * @param language Language (Defaults to en-US)
	 * @param page Page (Defaults to 1)
	 * @reference https://developer.themoviedb.org/reference/search-multi
	 */
	async multi(params: SearchMultiParams): Promise<PaginatedResponse<MultiSearchResultItem>> {
		return this.client.request<PaginatedResponse<MultiSearchResultItem>>(ENDPOINTS.SEARCH.MULTI, this.applyDefaults(params));
	}
}
