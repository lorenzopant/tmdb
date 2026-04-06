import { ENDPOINTS } from "../routes";
import type {
	ListClearParams,
	ListCreateBody,
	ListCreateParams,
	ListCreateResponse,
	ListDetails,
	ListDetailsParams,
	ListItemStatusParams,
	ListItemStatusResponse,
	ListMovieBody,
	ListMutationParams,
	ListMutationResponse,
} from "../types/lists";
import { TMDBAPIBase } from "./base";

export class ListsAPI extends TMDBAPIBase {
	private listPath(list_id: number): string {
		return `${ENDPOINTS.LISTS.DETAILS}/${list_id}`;
	}

	private listSubPath(list_id: number, route: string): string {
		return `${this.listPath(list_id)}${route}`;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/list/{list_id}
	 *
	 * Get the details of a list.
	 * @param params List ID and optional language and page.
	 * @reference https://developer.themoviedb.org/reference/list-details
	 */
	async details(params: ListDetailsParams): Promise<ListDetails> {
		const { list_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<ListDetails>(this.listPath(list_id), { language, ...rest });
	}

	/**
	 * Create
	 * POST - https://api.themoviedb.org/3/list
	 *
	 * Create a new list.
	 * @param params session_id query param (required).
	 * @param body name, description, and language for the new list.
	 * @reference https://developer.themoviedb.org/reference/list-create
	 */
	async create(params: ListCreateParams, body: ListCreateBody): Promise<ListCreateResponse> {
		return this.client.mutate<ListCreateResponse>("POST", ENDPOINTS.LISTS.DETAILS, body, params);
	}

	/**
	 * Delete
	 * DELETE - https://api.themoviedb.org/3/list/{list_id}
	 *
	 * Delete a list.
	 * @param params List ID and session_id (required).
	 * @reference https://developer.themoviedb.org/reference/list-delete
	 */
	async delete(params: ListMutationParams): Promise<ListMutationResponse> {
		const { list_id, ...queryParams } = params;
		return this.client.mutate<ListMutationResponse>("DELETE", this.listPath(list_id), undefined, queryParams);
	}

	/**
	 * Add Movie
	 * POST - https://api.themoviedb.org/3/list/{list_id}/add_item
	 *
	 * Add a movie to a list.
	 * @param params List ID and session_id (required).
	 * @param body media_id of the movie to add.
	 * @reference https://developer.themoviedb.org/reference/list-add-movie
	 */
	async add_movie(params: ListMutationParams, body: ListMovieBody): Promise<ListMutationResponse> {
		const { list_id, ...queryParams } = params;
		return this.client.mutate<ListMutationResponse>("POST", this.listSubPath(list_id, ENDPOINTS.LISTS.ADD_ITEM), body, queryParams);
	}

	/**
	 * Remove Movie
	 * POST - https://api.themoviedb.org/3/list/{list_id}/remove_item
	 *
	 * Remove a movie from a list.
	 * @param params List ID and session_id (required).
	 * @param body media_id of the movie to remove.
	 * @reference https://developer.themoviedb.org/reference/list-remove-movie
	 */
	async remove_movie(params: ListMutationParams, body: ListMovieBody): Promise<ListMutationResponse> {
		const { list_id, ...queryParams } = params;
		return this.client.mutate<ListMutationResponse>("POST", this.listSubPath(list_id, ENDPOINTS.LISTS.REMOVE_ITEM), body, queryParams);
	}

	/**
	 * Check Item Status
	 * GET - https://api.themoviedb.org/3/list/{list_id}/item_status
	 *
	 * Check if a movie has already been added to a list.
	 * @param params List ID and optional movie_id and language.
	 * @reference https://developer.themoviedb.org/reference/list-check-item-status
	 */
	async check_item_status(params: ListItemStatusParams): Promise<ListItemStatusResponse> {
		const { list_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<ListItemStatusResponse>(this.listSubPath(list_id, ENDPOINTS.LISTS.ITEM_STATUS), {
			language,
			...rest,
		});
	}

	/**
	 * Clear
	 * POST - https://api.themoviedb.org/3/list/{list_id}/clear
	 *
	 * Clear all items from a list. Pass `confirm: true` to confirm the operation.
	 * @param params List ID, session_id, and confirm flag (required).
	 * @reference https://developer.themoviedb.org/reference/list-clear
	 */
	async clear(params: ListClearParams): Promise<ListMutationResponse> {
		const { list_id, ...queryParams } = params;
		return this.client.mutate<ListMutationResponse>("POST", this.listSubPath(list_id, ENDPOINTS.LISTS.CLEAR), undefined, queryParams);
	}
}
