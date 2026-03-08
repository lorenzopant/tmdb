import { ENDPOINTS } from "../routes";
import { FindByIDParams, FindResults } from "../types";
import { TMDBAPIBase } from "./base";

export class FindAPI extends TMDBAPIBase {
	/**
	 * By ID
	 * GET - https://api.themoviedb.org/3/find/{external_id}
	 *
	 * Find movies, TV series, seasons, episodes, or people by an external ID.
	 *
	 * @param external_id External identifier to look up
	 * @param external_source Source namespace for the external ID
	 * @param language Language for localized results
	 * @reference https://developer.themoviedb.org/reference/find-by-id
	 */
	async by_id(params: FindByIDParams): Promise<FindResults> {
		const endpoint = `${ENDPOINTS.FIND}/${params.external_id}`;
		const requestParams = this.withLanguage(params) ?? params;
		return this.client.request<FindResults>(endpoint, requestParams);
	}
}
