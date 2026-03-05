import { ENDPOINTS } from "../routes";
import { ChangeResultItem, PaginatedResponse, WithPageAndDateRange } from "../types";
import { TMDBAPIBase } from "./base";

export class ChangesAPI extends TMDBAPIBase {
	/**
	 * Movie List
	 * GET - https://api.themoviedb.org/3/movie/changes
	 *
	 * Get a list of all of the movie ids that have been changed in the past 24 hours.
	 *
	 * @param page Page number
	 * @param start_date Start date for change items
	 * @param end_date End date for change items
	 * @reference https://developer.themoviedb.org/reference/changes-movie-list
	 */
	async movie_list(params?: WithPageAndDateRange): Promise<PaginatedResponse<ChangeResultItem>> {
		return this.client.request<PaginatedResponse<ChangeResultItem>>(ENDPOINTS.CHANGES.MOVIE_LIST, params);
	}

	/**
	 * People List
	 * GET - https://api.themoviedb.org/3/person/changes
	 *
	 * Get a list of all of the person ids that have been changed in the past 24 hours.
	 *
	 * @param page Page number
	 * @param start_date Start date for change items
	 * @param end_date End date for change items
	 * @reference https://developer.themoviedb.org/reference/changes-people-list
	 */
	async people_list(params?: WithPageAndDateRange): Promise<PaginatedResponse<ChangeResultItem>> {
		return this.client.request<PaginatedResponse<ChangeResultItem>>(ENDPOINTS.CHANGES.PEOPLE_LIST, params);
	}

	/**
	 * TV List
	 * GET - https://api.themoviedb.org/3/tv/changes
	 *
	 * Get a list of all of the tv show ids that have been changed in the past 24 hours.
	 *
	 * @param page Page number
	 * @param start_date Start date for change items
	 * @param end_date End date for change items
	 * @reference https://developer.themoviedb.org/reference/changes-tv-list
	 */
	async tv_list(params?: WithPageAndDateRange): Promise<PaginatedResponse<ChangeResultItem>> {
		return this.client.request<PaginatedResponse<ChangeResultItem>>(ENDPOINTS.CHANGES.TV_LIST, params);
	}
}
