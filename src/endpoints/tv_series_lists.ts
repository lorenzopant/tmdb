import { ApiClient } from "../client";
import { PaginatedResponse } from "../types";
import { TMDBOptions } from "../types/config";
import { TVSeriesListParams } from "../types/tv";
import { TVSeriesResultItem } from "../types/tv/tv_series";

import { TV_SERIES_ENDPOINTS } from "./tv_series";

export enum TVSeriesListEndpoints {
	AIRING_TODAY = "/airing_today",
	ON_THE_AIR = "/on_the_air",
	TOP_RATED = "/top_rated",
	POPULAR = "/popular",
}

export class TVSeriesListsAPI {
	private client: ApiClient;
	private defaultOptions: TMDBOptions;

	constructor(client: ApiClient, defaultOptions: TMDBOptions = {}) {
		this.client = client;
		this.defaultOptions = defaultOptions;
	}

	private withDefaults(params: TVSeriesListParams): TVSeriesListParams {
		const { language = this.defaultOptions.language, timezone = this.defaultOptions.timezone, ...rest } = params;
		return { language, timezone, ...rest };
	}

	/**
	 * Fetch TVSeries List Wrapper
	 * @param endpoint Endpoint to call
	 * @param params Params for the request
	 * @returns PaginatedResponse of TVSeriesResultItem
	 */
	private fetch_tv_series_list(endpoint: string, params: TVSeriesListParams = {}): Promise<PaginatedResponse<TVSeriesResultItem>> {
		return this.client.request<PaginatedResponse<TVSeriesResultItem>>(TV_SERIES_ENDPOINTS.TV + endpoint, this.withDefaults(params));
	}

	/**
	 * Airing Today
	 * GET - https://api.themoviedb.org/3/tv/airing_today
	 *
	 * Get a list of TV shows airing today.
	 * @param language Language (Defaults to en-US or TMDB default)
	 * @param page Page (Defaults to 1)
	 * @param timezone Timezone for the "today"
	 */
	async airing_today(params: TVSeriesListParams = {}): Promise<PaginatedResponse<TVSeriesResultItem>> {
		return this.fetch_tv_series_list(TVSeriesListEndpoints.AIRING_TODAY, params);
	}

	/**
	 * On The Air
	 * GET - https://api.themoviedb.org/3/tv/on_the_air
	 *
	 * Get a list of TV shows that air in the next 7 days.
	 * @param language Language (Defaults to en-US or TMDB default)
	 * @param page Page (Defaults to 1)
	 * @param timezone Timezone for the "today"
	 */
	async on_the_air(params: TVSeriesListParams = {}): Promise<PaginatedResponse<TVSeriesResultItem>> {
		return this.fetch_tv_series_list(TVSeriesListEndpoints.ON_THE_AIR, params);
	}

	/**
	 * Popular
	 * GET - https://api.themoviedb.org/3/tv/popular
	 *
	 * Get a list of TV shows ordered by popularity.
	 * @param language Language (Defaults to en-US or TMDB default)
	 * @param page Page (Defaults to 1)
	 */
	async popular(params: TVSeriesListParams = {}): Promise<PaginatedResponse<TVSeriesResultItem>> {
		return this.fetch_tv_series_list(TVSeriesListEndpoints.POPULAR, params);
	}

	/**
	 * Top Rated
	 * GET - https://api.themoviedb.org/3/tv/top_rated
	 *
	 * Get a list of movies ordered by rating.
	 * @param language Language (Defaults to en-US or TMDB default)
	 * @param page Page (Defaults to 1)
	 */
	async top_rated(params: TVSeriesListParams = {}): Promise<PaginatedResponse<TVSeriesResultItem>> {
		return this.fetch_tv_series_list(TVSeriesListEndpoints.TOP_RATED, params);
	}
}
