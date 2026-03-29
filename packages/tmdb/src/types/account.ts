import { MediaType, PaginatedResponse, WithLanguage, WithPage } from "./common";
import { Language } from "./config";
import { MovieResultItem, TVSeriesResultItem } from "./search";

// MARK: Shared

/** Sort order for paginated account lists. */
export type AccountSortBy = "created_at.asc" | "created_at.desc";

/** Common query params for paginated account media lists. */
export type AccountMediaListParams = {
	/** TMDB account ID. */
	account_id: number;
	/** Session ID (required for v3 session-based auth). */
	session_id?: string;
	/** Sort direction for the results. */
	sort_by?: AccountSortBy;
} & WithLanguage &
	WithPage;

/** Query params for the account lists endpoint (no language param). */
export type AccountListsParams = {
	/** TMDB account ID. */
	account_id: number;
	/** Session ID (required for v3 session-based auth). */
	session_id?: string;
} & WithPage;

// MARK: Details

/** Gravatar avatar sub-object inside AccountAvatar. */
type AccountGravatar = {
	/** MD5 hash of the account email used to fetch the Gravatar image. */
	hash: string;
};

/** TMDB-hosted avatar sub-object inside AccountAvatar. */
type AccountTMDBAvatar = {
	/** Path to the TMDB-hosted avatar image, or undefined if not set. */
	avatar_path?: string;
};

/** Avatar sources for an account. */
export type AccountAvatar = {
	/** Gravatar details. */
	gravatar: AccountGravatar;
	/** TMDB-hosted avatar details. */
	tmdb: AccountTMDBAvatar;
};

/** Public profile of a TMDB account. */
export type AccountDetails = {
	/** Avatar sources (Gravatar and TMDB). */
	avatar: AccountAvatar;
	/** Unique TMDB account ID. */
	id: number;
	/** ISO 639-1 language preference of the account. */
	iso_639_1: string;
	/** ISO 3166-1 country preference of the account. */
	iso_3166_1: string;
	/** Display name of the account. */
	name: string;
	/** Whether adult content is included in results for this account. */
	include_adult: boolean;
	/** TMDB username. */
	username: string;
};

/** Query params for the account details endpoint. */
export type AccountDetailsParams = {
	/** TMDB account ID. */
	account_id: number;
	/** Session ID (required for v3 session-based auth). */
	session_id?: string;
};

// MARK: Mutations

/** Request body for add_favorite. */
export type AccountAddFavoriteBody = {
	/** Media type to mark as favourite. */
	media_type: MediaType;
	/** TMDB ID of the media item. */
	media_id: number;
	/** Pass `true` to add, `false` to remove. */
	favorite: boolean;
};

/** Query params for add_favorite / add_to_watchlist mutations. */
export type AccountMutationParams = {
	/** TMDB account ID. */
	account_id: number;
	/** Session ID (required for v3 session-based auth). */
	session_id?: string;
};

/** Request body for add_to_watchlist. */
export type AccountAddToWatchlistBody = {
	/** Media type to add or remove. */
	media_type: MediaType;
	/** TMDB ID of the media item. */
	media_id: number;
	/** Pass `true` to add, `false` to remove. */
	watchlist: boolean;
};

/** Standard mutation response returned by add_favorite and add_to_watchlist. */
export type AccountMutationResponse = {
	/** TMDB internal status code (1 = success). */
	status_code: number;
	/** Human-readable status message. */
	status_message: string;
};

// MARK: Favorites & Watchlist results

/**
 * A movie in a user's favorites or watchlist.
 * Extends MovieResultItem with `adult` guaranteed present (TMDB always returns it here).
 */
export type AccountMovieItem = MovieResultItem & {
	/** Whether the movie is marked as adult content. */
	adult: boolean;
};

/**
 * A TV show in a user's favorites or watchlist.
 */
export type AccountTVItem = TVSeriesResultItem;

// MARK: Rated results

/** A movie from the user's rated movies list — includes the user-assigned rating. */
export type AccountRatedMovieItem = AccountMovieItem & {
	/** User rating on a 0.5–10 scale. */
	rating: number;
};

/** A TV show from the user's rated TV list — includes the user-assigned rating. */
export type AccountRatedTVItem = AccountTVItem & {
	/** User rating on a 0.5–10 scale. */
	rating: number;
};

/** A single TV episode from the user's rated episodes list. */
export type AccountRatedEpisodeItem = {
	/** Air date of the episode (YYYY-MM-DD). */
	air_date: string;
	/** Episode number within the season. */
	episode_number: number;
	/** Unique TMDB ID of the episode. */
	id: number;
	/** Episode title. */
	name: string;
	/** Episode synopsis. */
	overview: string;
	/** Internal production code. */
	production_code: string;
	/** Runtime in minutes. */
	runtime: number;
	/** Season number the episode belongs to. */
	season_number: number;
	/** TMDB ID of the parent TV show. */
	show_id: number;
	/** Path to the episode still image. */
	still_path?: string;
	/** Average TMDB vote score. */
	vote_average: number;
	/** Total number of TMDB votes. */
	vote_count: number;
	/** User rating on a 0.5–10 scale. */
	rating: number;
};

// MARK: Lists

/** Params for constructing account sub-paths (used internally). */
export type AccountPathParams = {
	/** TMDB account ID. */
	account_id: number;
	/** Optional language override (ISO 639-1). */
	language?: Language;
};

/** A custom list summary as returned by the account lists endpoint. */
export type AccountListItem = {
	/** List description. */
	description: string;
	/** Number of users who have favorited this list. */
	favorite_count: number;
	/** Unique TMDB list ID. */
	id: number;
	/** Number of items in the list. */
	item_count: number;
	/** ISO 639-1 language the list is written in. */
	iso_639_1: string;
	/** List type ("movie"). */
	list_type: string;
	/** Display name of the list. */
	name: string;
	/** Path to the list's poster image. */
	poster_path?: string;
};

// MARK: Response aliases

/** Paginated response of favorite or watchlist movies. */
export type AccountMovieListResponse = PaginatedResponse<AccountMovieItem>;

/** Paginated response of favorite or watchlist TV shows. */
export type AccountTVListResponse = PaginatedResponse<AccountTVItem>;

/** Paginated response of rated movies. */
export type AccountRatedMoviesResponse = PaginatedResponse<AccountRatedMovieItem>;

/** Paginated response of rated TV shows. */
export type AccountRatedTVResponse = PaginatedResponse<AccountRatedTVItem>;

/** Paginated response of rated TV episodes. */
export type AccountRatedEpisodesResponse = PaginatedResponse<AccountRatedEpisodeItem>;

/** Paginated response of account custom lists. */
export type AccountListsResponse = PaginatedResponse<AccountListItem>;
