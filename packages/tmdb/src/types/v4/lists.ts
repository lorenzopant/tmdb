import type { Language } from "../config/languages";

// MARK: Shared

/** A media type used in v4 list items. */
export type V4ListMediaType = "movie" | "tv";

/**
 * A single item reference used when adding, updating, or removing items from a v4 list.
 */
export type V4ListItemInput = {
	/** The TMDB media type. */
	media_type: V4ListMediaType;
	/** The TMDB media ID. */
	media_id: number;
	/** Optional per-item comment. */
	comment?: string;
};

/** Standard status/success response returned by mutating v4 list endpoints. */
export type V4ListStatusResponse = {
	/** Always `true` on success. */
	success: boolean;
	/** TMDB internal status code. */
	status_code: number;
	/** Human-readable status message. */
	status_message: string;
};

// MARK: Create List

/** Request body for POST /4/list. */
export type V4CreateListBody = {
	/** The name of the list. */
	name: string;
	/** ISO 639-1 language code (e.g. `"en"`). */
	iso_639_1: string;
	/** Optional description for the list. */
	description?: string;
	/** Whether the list is public. Defaults to `true`. */
	public?: boolean;
};

/**
 * Response from POST /4/list.
 * Returns the new list's ID alongside a standard status payload.
 */
export type V4CreateListResponse = V4ListStatusResponse & {
	/** The TMDB ID of the newly created list. */
	id: number;
};

// MARK: List Details

/** Parameters for GET /4/list/{list_id}. */
export type V4ListDetailsParams = {
	/** The TMDB list ID. */
	list_id: number;
	/** Language for localized fields. Defaults to `en-US`. */
	language?: Language;
	/** Page number. Defaults to `1`. */
	page?: number;
};

/**
 * A single media item returned inside a v4 list's results array.
 * Fields vary slightly between movie and TV show entries; common fields are listed here.
 */
export type V4ListResult = {
	/** Whether the item is adult-only content. */
	adult: boolean;
	/** Backdrop image path, or `null` if unavailable. */
	backdrop_path?: string;
	/** TMDB ID. */
	id: number;
	/** The media type. */
	media_type: V4ListMediaType;
	/** Original language. */
	original_language: string;
	/** Poster image path, or `null` if unavailable. */
	poster_path?: string;
	/** Popularity score. */
	popularity: number;
	/** Vote average. */
	vote_average: number;
	/** Total vote count. */
	vote_count: number;
	/** Movie: original title. */
	original_title?: string;
	/** Movie: release date (YYYY-MM-DD). */
	release_date?: string;
	/** Movie: title. */
	title?: string;
	/** Movie: whether the movie has a video. */
	video?: boolean;
	/** TV: original name. */
	original_name?: string;
	/** TV: first air date (YYYY-MM-DD). */
	first_air_date?: string;
	/** TV: name. */
	name?: string;
	/** TV: origin countries. */
	origin_country?: string[];
};

/**
 * Full list detail response from GET /4/list/{list_id}.
 * Includes paginated results.
 */
export type V4ListDetails = {
	/** The TMDB list ID. */
	id: number;
	/** Display name. */
	name: string;
	/** Description text. */
	description: string;
	/** Username of the list creator. */
	created_by: string;
	/** Backdrop image path, or `null`. */
	backdrop_path?: string;
	/** Cover poster image path, or `null`. */
	poster_path?: string;
	/** Whether the list is publicly visible. */
	public: boolean;
	/** ISO 639-1 language code. */
	iso_639_1: string;
	/** ISO 3166-1 country code. */
	iso_3166_1: string;
	/** Total number of items in the list. */
	item_count: number;
	/** Average rating across all rated items. */
	average_rating: number;
	/** Total combined runtime of all items (minutes). */
	runtime: number;
	/** Active sort_by mode. */
	sort_by: string;
	/** Total revenue of items in the list. */
	revenue: number;
	/** Per-item comments keyed by `"movie:{id}"` or `"tv:{id}"`. */
	comments: Record<string, string | null>;
	/** Internal TMDB object IDs. */
	object_ids: Record<string, string>;
	/** Current page of results. */
	page: number;
	/** Total number of pages. */
	total_pages: number;
	/** Total number of items. */
	total_results: number;
	/** Paginated media items. */
	results: V4ListResult[];
};

// MARK: Update List

/** Request body for PUT /4/list/{list_id}. */
export type V4UpdateListBody = {
	/** The TMDB list ID. */
	list_id: number;
	/** New display name. */
	name?: string;
	/** New description. */
	description?: string;
	/** Change visibility. */
	public?: boolean;
	/** Sort field (e.g. `"original_order.asc"`, `"vote_average.desc"`). */
	sort_by?: string;
};

// MARK: Delete List

/** Parameters for DELETE /4/list/{list_id}. */
export type V4DeleteListParams = {
	/** The TMDB list ID. */
	list_id: number;
};

// MARK: Add / Update / Remove Items

/** Request body for POST /4/list/{list_id}/items. */
export type V4AddListItemsBody = {
	/** Array of items to add. */
	items: V4ListItemInput[];
};

/** Per-item result within an add/update items response. */
export type V4ListItemResult = {
	/** Whether this individual item was successfully processed. */
	success: boolean;
	/** The media type. */
	media_type: V4ListMediaType;
	/** The TMDB media ID. */
	media_id: number;
};

/** Response from POST /4/list/{list_id}/items (add) and PUT /4/list/{list_id}/items (update). */
export type V4AddListItemsResponse = V4ListStatusResponse & {
	/** Per-item success status. */
	results: V4ListItemResult[];
};

/** Request body for PUT /4/list/{list_id}/items (update comments). */
export type V4UpdateListItemsBody = V4AddListItemsBody;

/** Response from PUT /4/list/{list_id}/items. */
export type V4UpdateListItemsResponse = V4AddListItemsResponse;

/** Request body for DELETE /4/list/{list_id}/items. */
export type V4RemoveListItemsBody = {
	/** Array of items to remove. */
	items: Pick<V4ListItemInput, "media_type" | "media_id">[];
};

// MARK: Check Item Status

/** Parameters for GET /4/list/{list_id}/item_status. */
export type V4ListItemStatusParams = {
	/** The TMDB list ID. */
	list_id: number;
	/** The media type to check. */
	media_type: V4ListMediaType;
	/** The TMDB media ID to check. */
	media_id: number;
};

/**
 * Response from GET /4/list/{list_id}/item_status.
 */
export type V4ListItemStatusResponse = {
	/** The TMDB list ID. */
	id: number;
	/** The media type. */
	media_type: V4ListMediaType;
	/** The TMDB media ID. */
	media_id: number;
};
