import type { PaginatedResponse, WithLanguage, WithPage } from "./common";
import type { AccountRatedEpisodeItem, AccountRatedMovieItem, AccountRatedTVItem, AccountSortBy } from "./account";

// MARK: Params

/** Common query params for paginated guest session rated lists. */
export type GuestSessionRatedParams = {
	/** The guest session ID. */
	guest_session_id: string;
	/** Sort direction for the results. */
	sort_by?: AccountSortBy;
} & WithLanguage &
	WithPage;

// MARK: Responses

/** Paginated response of rated movies for a guest session. */
export type GuestSessionRatedMoviesResponse = PaginatedResponse<AccountRatedMovieItem>;

/** Paginated response of rated TV shows for a guest session. */
export type GuestSessionRatedTVResponse = PaginatedResponse<AccountRatedTVItem>;

/** Paginated response of rated TV episodes for a guest session. */
export type GuestSessionRatedEpisodesResponse = PaginatedResponse<AccountRatedEpisodeItem>;
