import { ENDPOINTS_V4 } from "../../routes";
import { TMDBAPIBase } from "../base";
import type {
	V4CreateListBody,
	V4CreateListResponse,
	V4ListDetails,
	V4ListDetailsParams,
	V4UpdateListBody,
	V4ListStatusResponse,
	V4DeleteListParams,
	V4AddListItemsBody,
	V4AddListItemsResponse,
	V4UpdateListItemsBody,
	V4UpdateListItemsResponse,
	V4RemoveListItemsBody,
	V4ListItemStatusParams,
	V4ListItemStatusResponse,
} from "../../types/v4/lists";

export class V4ListsAPI extends TMDBAPIBase {
	private listPath(list_id: number): string {
		return `${ENDPOINTS_V4.LISTS.DETAILS}/${list_id}`;
	}

	/**
	 * Create List
	 * POST - https://api.themoviedb.org/4/list
	 *
	 * Create a new v4 list. The authenticated user becomes the owner.
	 * @param body List name and ISO 639-1 language code are required.
	 * @reference https://developer.themoviedb.org/reference/list-create
	 */
	async create(body: V4CreateListBody): Promise<V4CreateListResponse> {
		return this.client.mutate<V4CreateListResponse>("POST", ENDPOINTS_V4.LISTS.DETAILS, body);
	}

	/**
	 * List Details
	 * GET - https://api.themoviedb.org/4/list/{list_id}
	 *
	 * Retrieve the details and paginated items of a specific list.
	 * @param params `list_id` is required. Optionally pass `language` and `page`.
	 * @reference https://developer.themoviedb.org/reference/list-details
	 */
	async details({ list_id, ...params }: V4ListDetailsParams): Promise<V4ListDetails> {
		return this.client.request<V4ListDetails>(this.listPath(list_id), this.withLanguage(params));
	}

	/**
	 * Update List
	 * PUT - https://api.themoviedb.org/4/list/{list_id}
	 *
	 * Update the metadata (name, description, visibility, sort order) of an existing list.
	 * @param body `list_id` plus any fields to change.
	 * @reference https://developer.themoviedb.org/reference/list-update
	 */
	async update({ list_id, ...body }: V4UpdateListBody): Promise<V4ListStatusResponse> {
		return this.client.mutate<V4ListStatusResponse>("PUT", this.listPath(list_id), body);
	}

	/**
	 * Delete List
	 * DELETE - https://api.themoviedb.org/4/list/{list_id}
	 *
	 * Permanently delete a list. This action cannot be undone.
	 * @param params.list_id The TMDB list ID to delete.
	 * @reference https://developer.themoviedb.org/reference/list-delete
	 */
	async delete({ list_id }: V4DeleteListParams): Promise<V4ListStatusResponse> {
		return this.client.mutate<V4ListStatusResponse>("DELETE", this.listPath(list_id), {});
	}

	/**
	 * Add Items
	 * POST - https://api.themoviedb.org/4/list/{list_id}/items
	 *
	 * Add one or more movies or TV shows to a list. For each item the response
	 * includes whether it was added successfully.
	 * @param list_id The TMDB list ID.
	 * @param body Array of `{ media_type, media_id }` objects to add.
	 * @reference https://developer.themoviedb.org/reference/list-add-items
	 */
	async add_items(list_id: number, body: V4AddListItemsBody): Promise<V4AddListItemsResponse> {
		return this.client.mutate<V4AddListItemsResponse>("POST", `${this.listPath(list_id)}${ENDPOINTS_V4.LISTS.ITEMS}`, body);
	}

	/**
	 * Update Items
	 * PUT - https://api.themoviedb.org/4/list/{list_id}/items
	 *
	 * Update per-item comments for items already in the list.
	 * @param list_id The TMDB list ID.
	 * @param body Array of `{ media_type, media_id, comment }` objects.
	 * @reference https://developer.themoviedb.org/reference/list-update-items
	 */
	async update_items(list_id: number, body: V4UpdateListItemsBody): Promise<V4UpdateListItemsResponse> {
		return this.client.mutate<V4UpdateListItemsResponse>("PUT", `${this.listPath(list_id)}${ENDPOINTS_V4.LISTS.ITEMS}`, body);
	}

	/**
	 * Remove Items
	 * DELETE - https://api.themoviedb.org/4/list/{list_id}/items
	 *
	 * Remove one or more items from the list.
	 * @param list_id The TMDB list ID.
	 * @param body Array of `{ media_type, media_id }` objects to remove.
	 * @reference https://developer.themoviedb.org/reference/list-remove-items
	 */
	async remove_items(list_id: number, body: V4RemoveListItemsBody): Promise<V4ListStatusResponse> {
		return this.client.mutate<V4ListStatusResponse>("DELETE", `${this.listPath(list_id)}${ENDPOINTS_V4.LISTS.ITEMS}`, body);
	}

	/**
	 * Check Item Status
	 * GET - https://api.themoviedb.org/4/list/{list_id}/item_status
	 *
	 * Check whether a specific movie or TV show is already present in the list.
	 * @param params `list_id`, `media_type`, and `media_id` are all required.
	 * @reference https://developer.themoviedb.org/reference/list-item-status
	 */
	async item_status({ list_id, ...params }: V4ListItemStatusParams): Promise<V4ListItemStatusResponse> {
		return this.client.request<V4ListItemStatusResponse>(`${this.listPath(list_id)}${ENDPOINTS_V4.LISTS.ITEM_STATUS}`, params);
	}

	/**
	 * Clear List
	 * GET - https://api.themoviedb.org/4/list/{list_id}/clear
	 *
	 * Remove all items from the list without deleting the list itself.
	 * @param list_id The TMDB list ID to clear.
	 * @reference https://developer.themoviedb.org/reference/list-clear
	 */
	async clear(list_id: number): Promise<V4ListStatusResponse> {
		return this.client.mutate<V4ListStatusResponse>("GET", `${this.listPath(list_id)}${ENDPOINTS_V4.LISTS.CLEAR}`);
	}
}
