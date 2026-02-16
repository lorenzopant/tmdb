import { ApiClient } from "../client";
import { TMDBOptions } from "../types";
import { TVDetails, TVDetailsWithAppends, TVAppendToResponseNamespace } from "../types/tv";
import { TVDetailsParams } from "../types/params";

export const TV_SERIES_ENDPOINTS = {
	TV: "/tv",
};

export class TVSeriesAPI {
	private client: ApiClient;
	private defaultOptions: TMDBOptions;

	constructor(client: ApiClient, defaultOptions: TMDBOptions = {}) {
		this.client = client;
		this.defaultOptions = defaultOptions;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/tv/{tv_id}
	 *
	 * Get the top level details of a TV series by ID.
	 * @param tv_id The ID of the TV series.
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
}
