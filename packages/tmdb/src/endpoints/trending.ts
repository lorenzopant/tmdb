import type {
	PaginatedResponse,
	TrendingAllResult,
	TrendingMovieResult,
	TrendingParams,
	TrendingPersonResult,
	TrendingTVResult,
} from "../types";
import { ENDPOINTS } from "../routes";
import { TMDBAPIBase } from "./base";

export class TrendingAPI extends TMDBAPIBase {
	/**
	 * Trending All
	 * GET - https://api.themoviedb.org/3/trending/all/{time_window}
	 *
	 * Get the trending movies, TV shows and people on TMDB.
	 * @reference https://developer.themoviedb.org/reference/trending-all
	 */
	async all(params: TrendingParams): Promise<PaginatedResponse<TrendingAllResult>> {
		const { time_window, language = this.defaultOptions.language } = params;
		return this.client.request<PaginatedResponse<TrendingAllResult>>(`${ENDPOINTS.TRENDING.ALL}/${time_window}`, { language });
	}

	/**
	 * Trending Movies
	 * GET - https://api.themoviedb.org/3/trending/movie/{time_window}
	 *
	 * Get the trending movies on TMDB.
	 * @reference https://developer.themoviedb.org/reference/trending-movies
	 */
	async movies(params: TrendingParams): Promise<PaginatedResponse<TrendingMovieResult>> {
		const { time_window, language = this.defaultOptions.language } = params;
		return this.client.request<PaginatedResponse<TrendingMovieResult>>(`${ENDPOINTS.TRENDING.MOVIE}/${time_window}`, { language });
	}

	/**
	 * Trending TV
	 * GET - https://api.themoviedb.org/3/trending/tv/{time_window}
	 *
	 * Get the trending TV shows on TMDB.
	 * @reference https://developer.themoviedb.org/reference/trending-tv
	 */
	async tv(params: TrendingParams): Promise<PaginatedResponse<TrendingTVResult>> {
		const { time_window, language = this.defaultOptions.language } = params;
		return this.client.request<PaginatedResponse<TrendingTVResult>>(`${ENDPOINTS.TRENDING.TV}/${time_window}`, { language });
	}

	/**
	 * Trending People
	 * GET - https://api.themoviedb.org/3/trending/person/{time_window}
	 *
	 * Get the trending people on TMDB.
	 * @reference https://developer.themoviedb.org/reference/trending-people
	 */
	async people(params: TrendingParams): Promise<PaginatedResponse<TrendingPersonResult>> {
		const { time_window, language = this.defaultOptions.language } = params;
		return this.client.request<PaginatedResponse<TrendingPersonResult>>(`${ENDPOINTS.TRENDING.PERSON}/${time_window}`, { language });
	}
}
