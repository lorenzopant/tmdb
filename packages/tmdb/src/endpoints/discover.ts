import { ENDPOINTS } from "../routes";
import { DiscoverMovieParams, DiscoverTVParams, DiscoverTVResultItem, MovieResultItem, PaginatedResponse } from "../types";
import { TMDBAPIBase } from "./base";

export class DiscoverAPI extends TMDBAPIBase {
	/**
	 * TMDB discover filtering notes:
	 *
	 * - If `region` is provided on movie discover, TMDB uses the regional release date
	 *   instead of the primary release date. When `with_release_type` is also provided,
	 *   the returned release date follows the order of the specified release types.
	 * - Filters that accept comma-separated or pipe-separated values are forwarded as-is:
	 *   commas mean AND, pipes mean OR.
	 *
	 * @reference https://developer.themoviedb.org/reference/discover-movie
	 * @reference https://developer.themoviedb.org/reference/discover-tv
	 */
	private withMovieDefaults(params?: DiscoverMovieParams): DiscoverMovieParams | undefined {
		if (!params && !this.defaultOptions.language && !this.defaultOptions.region) return undefined;

		const language = params?.language ?? this.defaultOptions.language;
		const region = params?.region ?? this.defaultOptions.region;

		return {
			...params,
			language,
			region,
		};
	}

	private withTVDefaults(params?: DiscoverTVParams): DiscoverTVParams | undefined {
		if (!params && !this.defaultOptions.language && !this.defaultOptions.timezone) {
			return undefined;
		}

		const language = params?.language ?? this.defaultOptions.language;
		const timezone = params?.timezone ?? this.defaultOptions.timezone;

		return {
			...params,
			language,
			timezone,
		};
	}

	/**
	 * Movie
	 * GET - https://api.themoviedb.org/3/discover/movie
	 *
	 * Discover movies by applying filters and sort options.
	 *
	 * @reference https://developer.themoviedb.org/reference/discover-movie
	 */
	async movie(params: DiscoverMovieParams = {}): Promise<PaginatedResponse<MovieResultItem>> {
		return this.client.request<PaginatedResponse<MovieResultItem>>(ENDPOINTS.DISCOVER.MOVIE, this.withMovieDefaults(params));
	}

	/**
	 * TV
	 * GET - https://api.themoviedb.org/3/discover/tv
	 *
	 * Discover TV series by applying filters and sort options.
	 *
	 * @reference https://developer.themoviedb.org/reference/discover-tv
	 */
	async tv(params: DiscoverTVParams = {}): Promise<PaginatedResponse<DiscoverTVResultItem>> {
		return this.client.request<PaginatedResponse<DiscoverTVResultItem>>(ENDPOINTS.DISCOVER.TV, this.withTVDefaults(params));
	}
}
