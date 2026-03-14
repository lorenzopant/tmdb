import { ApiClient } from "../client";
import { PaginatedResponse, TVSeriesResultItem } from "../types";
import { ENDPOINTS } from "../routes";
import { TMDBOptions } from "../types/config";
import { TVSeriesListParams } from "../types/tv-series";

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
		return this.client.request<PaginatedResponse<TVSeriesResultItem>>(
			ENDPOINTS.TV_SERIES.DETAILS + endpoint,
			this.withDefaults(params),
		);
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
		return this.fetch_tv_series_list(ENDPOINTS.TV_SERIES.AIRING_TODAY, params);
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
		return this.fetch_tv_series_list(ENDPOINTS.TV_SERIES.ON_THE_AIR, params);
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
		return this.fetch_tv_series_list(ENDPOINTS.TV_SERIES.POPULAR, params);
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
		return this.fetch_tv_series_list(ENDPOINTS.TV_SERIES.TOP_RATED, params);
	}
}
