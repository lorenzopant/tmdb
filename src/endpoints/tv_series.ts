import { TVAggregateCreditsParams, TVBaseParam, TVDetailsParams } from "../types/tv";
import { TVAggregateCredits } from "../types/tv/aggregate_credits";
import { TVAppendToResponseNamespace, TVDetails, TVDetailsWithAppends } from "../types/tv/tv_series";
import { TMDBAPIBase } from "./base";

export const TV_SERIES_ENDPOINTS = {
	TV: "/tv",
	TV_AGGREGATE_CREDITS: "/aggregate_credits",
	TV_ALTERNATIVE_TITLES: "/alternative_titles",
	TV_CHANGES: "/changes",
	TV_CONTENT_RATINGS: "/content_ratings",
};

export class TVSeriesAPI extends TMDBAPIBase {
	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/tv/{tv_id}
	 *
	 * Get the top level details of a TV series by ID.
	 * @param series_id The ID of the TV series.
	 * @param append_to_response A comma-separated list of the fields to include in the response.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the TV series details.
	 * @reference https://developer.themoviedb.org/reference/tv-series-details
	 */
	async details<T extends readonly TVAppendToResponseNamespace[] = []>(
		params: TVDetailsParams & { append_to_response?: T[number] | T },
	): Promise<T extends [] ? TVDetails : TVDetailsWithAppends<T>> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}`;
		return this.client.request(endpoint, { language, ...rest });
	}

	/**
	 * Aggregate Credits
	 * GET - https://api.themoviedb.org/3/tv/{tv_id}/aggregate_credits
	 *
	 * Get the aggregate credits (cast and crew) that have been added to a TV show.
	 *
	 * NOTE: This call differs from the main credits call in that it does not return the newest season.
	 * Instead, it is a view of all the entire cast & crew for all episodes belonging to a TV show.
	 * @param series_id The ID of the TV series.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the TV series aggregate credits.
	 * @reference https://developer.themoviedb.org/reference/tv-series-aggregate-credits
	 */
	async aggregate_credits(params: TVAggregateCreditsParams): Promise<TVAggregateCredits> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_AGGREGATE_CREDITS}`;
		return this.client.request(endpoint, { language, ...rest });
	}

	/**
	 * Alternative Titles
	 * GET - https://api.themoviedb.org/3/tv/{tv_id}/alternative_tiles
	 *
	 * Get the alternative titles that have been added to a TV show.
	 * @param series_id The ID of the TV series.
	 * @returns A promise that resolves to the TV series alternative tiles.
	 * @reference https://developer.themoviedb.org/reference/tv-series-alternative-titles
	 */
	async alternative_titles(params: TVBaseParam): Promise<TVAggregateCredits> {
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_ALTERNATIVE_TITLES}`;
		return this.client.request(endpoint);
	}
}
