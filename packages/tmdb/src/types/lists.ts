import type { WithLanguage, WithPage } from "./common";

// MARK: Shared

/** Standard mutation response returned by add_movie, remove_movie, clear, and delete. */
export type ListMutationResponse = {
	/** TMDB internal status code. */
	status_code: number;
	/** Human-readable status message. */
	status_message: string;
};

/** Query params for list mutation endpoints that require a session and a list ID. */
export type ListMutationParams = {
	/** TMDB list ID. */
	list_id: number;
	/** v3 session ID (required). */
	session_id: string;
};

// MARK: Details

/** A single item inside a TMDB v3 list (movie with media_type). */
export type ListItem = {
	/** Whether the item is adult content. */
	adult: boolean;
	/** Path to the backdrop image, if available. */
	backdrop_path?: string;
	/** Array of genre IDs. */
	genre_ids: number[];
	/** Unique TMDB ID of the item. */
	id: number;
	/** Media type — always `"movie"` for v3 lists. */
	media_type: string;
	/** ISO 639-1 original language code. */
	original_language: string;
	/** Original title. */
	original_title: string;
	/** Plot overview. */
	overview: string;
	/** Popularity score. */
	popularity: number;
	/** Path to the poster image, if available. */
	poster_path?: string;
	/** Release date (YYYY-MM-DD). */
	release_date: string;
	/** Localized title. */
	title: string;
	/** Whether the item has a video. */
	video: boolean;
	/** Average TMDB vote score. */
	vote_average: number;
	/** Total number of TMDB votes. */
	vote_count: number;
};

/** Full details of a TMDB v3 list. */
export type ListDetails = {
	/** Display name of the list creator. */
	created_by: string;
	/** Description of the list. */
	description: string;
	/** Number of users who have favorited this list. */
	favorite_count: number;
	/** Unique TMDB list ID (returned as a string by the API). */
	id: string;
	/** Array of items in the list. */
	items: ListItem[];
	/** Total number of items in the list. */
	item_count: number;
	/** ISO 639-1 language the list is written in. */
	iso_639_1: string;
	/** Display name of the list. */
	name: string;
	/** Path to the list's poster image, if set. */
	poster_path?: string;
};

/** Query params for the list details endpoint. */
export type ListDetailsParams = {
	/** TMDB list ID. */
	list_id: number;
} & WithLanguage &
	WithPage;

// MARK: Create

/** Request body for creating a new list. */
export type ListCreateBody = {
	/** Display name of the list. */
	name: string;
	/** Description of the list. */
	description: string;
	/** ISO 639-1 language code for the list. */
	language: string;
};

/** Query params for the create list endpoint. */
export type ListCreateParams = {
	/** v3 session ID (required). */
	session_id: string;
};

/** Response from creating a new list. */
export type ListCreateResponse = {
	/** Human-readable status message. */
	status_message: string;
	/** Whether the list was created successfully. */
	success: boolean;
	/** TMDB internal status code. */
	status_code: number;
	/** The ID of the newly created list. */
	list_id: number;
};

// MARK: Add / Remove Movie

/** Request body for add_movie and remove_movie. */
export type ListMovieBody = {
	/** TMDB movie ID to add or remove. */
	media_id: number;
};

// MARK: Clear

/** Query params for clearing all items from a list. */
export type ListClearParams = {
	/** TMDB list ID. */
	list_id: number;
	/** v3 session ID (required). */
	session_id: string;
	/** Must be `true` to confirm the operation. */
	confirm: boolean;
};

// MARK: Check Item Status

/** Query params for the check item status endpoint. */
export type ListItemStatusParams = {
	/** TMDB list ID. */
	list_id: number;
	/** TMDB movie ID to check. */
	movie_id?: number;
} & WithLanguage;

/** Response from the check item status endpoint. */
export type ListItemStatusResponse = {
	/** The TMDB list ID. */
	id: number;
	/** Whether the movie is present in the list. */
	item_present: boolean;
};
