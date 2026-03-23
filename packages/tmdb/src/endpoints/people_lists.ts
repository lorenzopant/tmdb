import type { PaginatedResponse } from "../types";
import type { PersonResultItem } from "../types/search";
import type { PeopleListParams } from "../types/people-lists";
import { ENDPOINTS } from "../routes";
import { TMDBAPIBase } from "./base";

export class PeopleListsAPI extends TMDBAPIBase {
	/**
	 * Popular
	 * GET - https://api.themoviedb.org/3/person/popular
	 *
	 * Get a list of people ordered by popularity.
	 * @param language Language for localised results (Defaults to en-US or TMDB default)
	 * @param page Page number (Defaults to 1)
	 * @reference https://developer.themoviedb.org/reference/person-popular-list
	 */
	async popular(params: PeopleListParams = {}): Promise<PaginatedResponse<PersonResultItem>> {
		return this.client.request<PaginatedResponse<PersonResultItem>>(
			ENDPOINTS.PEOPLE_LISTS.POPULAR,
			this.withLanguage(params) ?? params,
		);
	}
}
