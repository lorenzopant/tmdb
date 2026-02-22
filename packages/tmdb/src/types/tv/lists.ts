import { PaginatedResponse } from "../common";
import { CountryISO3166_1, LanguageISO6391 } from "../config";

/**
 * Represents a paginated collection of TV series lists, extended with a unique identifier.
 * Combines a standard `PaginatedResponse<TVSeriesListItem>` with an `id` field
 * that uniquely identifies the tv show.
 */
export type TVSeriesLists = PaginatedResponse<TVSeriesListItem> & { id: number };

/**
 * Represents a single TV series list entry as returned by the TMDB API.
 */
export type TVSeriesListItem = {
	/** A brief description of the list provided by its creator. */
	description: string;
	/** The number of times this list has been marked as a favorite by TMDB users. */
	favorite_count: number;
	/** The unique identifier for this list on TMDB. */
	id: number;
	/** The total number of items (TV series) currently in this list. */
	item_count: number;
	/** The primary language of the list content as an ISO 639-1 code (e.g. `"en"`). */
	iso_639_1: string | LanguageISO6391;
	/** The country associated with the list as an ISO 3166-1 alpha-2 code (e.g. `"US"`). */
	iso_3166_1: string | CountryISO3166_1;
	/** The display name of the list. */
	name: string;
	/** Path to the list's poster image on the TMDB CDN. Combine with a base URL to get the full image path. */
	poster_path?: string;
};
