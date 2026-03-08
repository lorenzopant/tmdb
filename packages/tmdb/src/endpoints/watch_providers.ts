import { ENDPOINTS } from "../routes";
import { WatchProviderListParams, WatchProviderListResponse, WatchProviderRegionsParams, WatchProviderRegionsResponse } from "../types";
import { TMDBAPIBase } from "./base";

export class WatchProvidersAPI extends TMDBAPIBase {
	/**
	 * Movie Providers
	 * GET - https://api.themoviedb.org/3/watch/providers/movie
	 *
	 * Get the list of movie watch providers supported by TMDB.
	 *
	 * @param language Language used for localized provider names
	 * @reference https://developer.themoviedb.org/reference/watch-provider-movie-list
	 */
	async movie_providers(params?: WatchProviderListParams): Promise<WatchProviderListResponse> {
		const language = params?.language ?? this.defaultOptions.language;
		const requestParams = language === undefined ? params : { ...params, language };
		return this.client.request<WatchProviderListResponse>(ENDPOINTS.WATCH_PROVIDERS.MOVIE, requestParams);
	}

	/**
	 * TV Providers
	 * GET - https://api.themoviedb.org/3/watch/providers/tv
	 *
	 * Get the list of TV watch providers supported by TMDB.
	 *
	 * @param language Language used for localized provider names
	 * @reference https://developer.themoviedb.org/reference/watch-provider-tv-list
	 */
	async tv_providers(params?: WatchProviderListParams): Promise<WatchProviderListResponse> {
		const language = params?.language ?? this.defaultOptions.language;
		const requestParams = language === undefined ? params : { ...params, language };
		return this.client.request<WatchProviderListResponse>(ENDPOINTS.WATCH_PROVIDERS.TV, requestParams);
	}

	/**
	 * Available Regions
	 * GET - https://api.themoviedb.org/3/watch/providers/regions
	 *
	 * Get the list of regions with watch provider support.
	 *
	 * @param language Language used for localized region names
	 * @reference https://developer.themoviedb.org/reference/watch-providers-available-regions
	 */
	async available_regions(params?: WatchProviderRegionsParams): Promise<WatchProviderRegionsResponse> {
		const language = params?.language ?? this.defaultOptions.language;
		const requestParams = language === undefined ? params : { ...params, language };
		return this.client.request<WatchProviderRegionsResponse>(ENDPOINTS.WATCH_PROVIDERS.REGIONS, requestParams);
	}
}
