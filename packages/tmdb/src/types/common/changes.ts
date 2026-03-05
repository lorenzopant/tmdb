import { PaginatedResponse } from "./pagination";

/**
 * Container for entity change history
 */
export type Changes = {
	/** Array of changes grouped by type */
	changes: Change[];
};

/**
 * Group of changes for a specific field or property
 */
export type Change = {
	/** Name of the field that changed (e.g., "title", "overview", "images") */
	key: string;
	/** Individual change entries for this field */
	items: ChangeItem[];
};

/**
 * Individual change record with action details
 */
export type ChangeItem = {
	/** Unique identifier for the changed item */
	id: number;
	/** Type of change performed (e.g., "added", "updated", "deleted") */
	action: string;
	/** Timestamp of when the change occurred (ISO 8601 format) */
	time: string;
	/** ISO 639-1 language code associated with the change */
	iso_639_1: string;
	/** ISO 3166-1 country code associated with the change */
	iso_3166_1: string;
	/** The changed data object (structure varies by change type) */
	value: object;
	/** The original data object (structure varies by change type) */
	original_value?: object;
};

/**
 * Response given by the Changes endpoint for: movie list, tv list and people list,
 * returning a list of movies, tv shows, or people that have been changed (last 24 hours by default).
 */
export type ChangeResults = PaginatedResponse<ChangeResultItem>;

/**
 * Represents a single change result item from the changes endpoint.
 */
export type ChangeResultItem = {
	/** Id of the movie, tv show or person */
	id: number;
	/** Whether the movie, tv show or person is marked as adult content */
	adult: boolean;
};
