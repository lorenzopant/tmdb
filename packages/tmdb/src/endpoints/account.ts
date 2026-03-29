import { ENDPOINTS } from "../routes";
import { TMDBAPIBase } from "./base";
import type {
	AccountAddFavoriteBody,
	AccountAddToWatchlistBody,
	AccountDetails,
	AccountDetailsParams,
	AccountListItem,
	AccountListsParams,
	AccountMediaListParams,
	AccountMovieListResponse,
	AccountMutationParams,
	AccountMutationResponse,
	AccountRatedEpisodesResponse,
	AccountRatedMoviesResponse,
	AccountRatedTVResponse,
	AccountTVListResponse,
} from "../types/account";
import type { PaginatedResponse } from "../types/common";

export class AccountAPI extends TMDBAPIBase {
	private accountPath(account_id: number): string {
		return `${ENDPOINTS.ACCOUNT.DETAILS}/${account_id}`;
	}

	private accountSubPath(account_id: number, route: string): string {
		return `${this.accountPath(account_id)}${route}`;
	}

	/**
	 * Account Details
	 * GET - https://api.themoviedb.org/3/account/{account_id}
	 *
	 * Get the details of an account.
	 * @param account_id The TMDB account ID.
	 * @param session_id Session ID required for v3 session-based auth.
	 * @reference https://developer.themoviedb.org/reference/account-details
	 */
	async details(params: AccountDetailsParams): Promise<AccountDetails> {
		const { account_id, ...rest } = params;
		return this.client.request<AccountDetails>(this.accountPath(account_id), rest);
	}

	/**
	 * Add Favorite
	 * POST - https://api.themoviedb.org/3/account/{account_id}/favorite
	 *
	 * Mark a movie or TV show as a favourite. Pass `favorite: false` to remove it.
	 * @param params Account ID and optional session_id.
	 * @param body media_type, media_id, and favorite flag.
	 * @reference https://developer.themoviedb.org/reference/account-add-favorite
	 */
	async add_favorite(
		params: AccountMutationParams,
		body: AccountAddFavoriteBody,
	): Promise<AccountMutationResponse> {
		const { account_id, ...queryParams } = params;
		return this.client.mutate<AccountMutationResponse>(
			"POST",
			this.accountSubPath(account_id, ENDPOINTS.ACCOUNT.ADD_FAVORITE),
			body,
			queryParams,
		);
	}

	/**
	 * Add to Watchlist
	 * POST - https://api.themoviedb.org/3/account/{account_id}/watchlist
	 *
	 * Add a movie or TV show to your watchlist. Pass `watchlist: false` to remove it.
	 * @param params Account ID and optional session_id.
	 * @param body media_type, media_id, and watchlist flag.
	 * @reference https://developer.themoviedb.org/reference/account-add-to-watchlist
	 */
	async add_to_watchlist(
		params: AccountMutationParams,
		body: AccountAddToWatchlistBody,
	): Promise<AccountMutationResponse> {
		const { account_id, ...queryParams } = params;
		return this.client.mutate<AccountMutationResponse>(
			"POST",
			this.accountSubPath(account_id, ENDPOINTS.ACCOUNT.ADD_TO_WATCHLIST),
			body,
			queryParams,
		);
	}

	/**
	 * Favorite Movies
	 * GET - https://api.themoviedb.org/3/account/{account_id}/favorite/movies
	 *
	 * Get the list of movies you have marked as a favourite.
	 * @param account_id The TMDB account ID.
	 * @reference https://developer.themoviedb.org/reference/account-get-favorites
	 */
	async favorite_movies(params: AccountMediaListParams): Promise<AccountMovieListResponse> {
		const { account_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<AccountMovieListResponse>(
			this.accountSubPath(account_id, ENDPOINTS.ACCOUNT.FAVORITE_MOVIES),
			{ language, ...rest },
		);
	}

	/**
	 * Favorite TV Shows
	 * GET - https://api.themoviedb.org/3/account/{account_id}/favorite/tv
	 *
	 * Get the list of TV shows you have marked as a favourite.
	 * @param account_id The TMDB account ID.
	 * @reference https://developer.themoviedb.org/reference/account-get-favorites
	 */
	async favorite_tv(params: AccountMediaListParams): Promise<AccountTVListResponse> {
		const { account_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<AccountTVListResponse>(
			this.accountSubPath(account_id, ENDPOINTS.ACCOUNT.FAVORITE_TV),
			{ language, ...rest },
		);
	}

	/**
	 * Watchlist Movies
	 * GET - https://api.themoviedb.org/3/account/{account_id}/watchlist/movies
	 *
	 * Get the list of movies you have added to your watchlist.
	 * @param account_id The TMDB account ID.
	 * @reference https://developer.themoviedb.org/reference/account-watchlist-movies
	 */
	async watchlist_movies(params: AccountMediaListParams): Promise<AccountMovieListResponse> {
		const { account_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<AccountMovieListResponse>(
			this.accountSubPath(account_id, ENDPOINTS.ACCOUNT.WATCHLIST_MOVIES),
			{ language, ...rest },
		);
	}

	/**
	 * Watchlist TV Shows
	 * GET - https://api.themoviedb.org/3/account/{account_id}/watchlist/tv
	 *
	 * Get the list of TV shows you have added to your watchlist.
	 * @param account_id The TMDB account ID.
	 * @reference https://developer.themoviedb.org/reference/account-watchlist-tv
	 */
	async watchlist_tv(params: AccountMediaListParams): Promise<AccountTVListResponse> {
		const { account_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<AccountTVListResponse>(
			this.accountSubPath(account_id, ENDPOINTS.ACCOUNT.WATCHLIST_TV),
			{ language, ...rest },
		);
	}

	/**
	 * Rated Movies
	 * GET - https://api.themoviedb.org/3/account/{account_id}/rated/movies
	 *
	 * Get the list of movies you have rated.
	 * @param account_id The TMDB account ID.
	 * @reference https://developer.themoviedb.org/reference/account-rated-movies
	 */
	async rated_movies(params: AccountMediaListParams): Promise<AccountRatedMoviesResponse> {
		const { account_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<AccountRatedMoviesResponse>(
			this.accountSubPath(account_id, ENDPOINTS.ACCOUNT.RATED_MOVIES),
			{ language, ...rest },
		);
	}

	/**
	 * Rated TV Shows
	 * GET - https://api.themoviedb.org/3/account/{account_id}/rated/tv
	 *
	 * Get the list of TV shows you have rated.
	 * @param account_id The TMDB account ID.
	 * @reference https://developer.themoviedb.org/reference/account-rated-tv
	 */
	async rated_tv(params: AccountMediaListParams): Promise<AccountRatedTVResponse> {
		const { account_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<AccountRatedTVResponse>(
			this.accountSubPath(account_id, ENDPOINTS.ACCOUNT.RATED_TV),
			{ language, ...rest },
		);
	}

	/**
	 * Rated TV Episodes
	 * GET - https://api.themoviedb.org/3/account/{account_id}/rated/tv/episodes
	 *
	 * Get the list of TV episodes you have rated.
	 * @param account_id The TMDB account ID.
	 * @reference https://developer.themoviedb.org/reference/account-rated-tv-episodes
	 */
	async rated_tv_episodes(params: AccountMediaListParams): Promise<AccountRatedEpisodesResponse> {
		const { account_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<AccountRatedEpisodesResponse>(
			this.accountSubPath(account_id, ENDPOINTS.ACCOUNT.RATED_TV_EPISODES),
			{ language, ...rest },
		);
	}

	/**
	 * Lists
	 * GET - https://api.themoviedb.org/3/account/{account_id}/lists
	 *
	 * Get all of the lists you have created.
	 * @param account_id The TMDB account ID.
	 * @reference https://developer.themoviedb.org/reference/account-lists
	 */
	async lists(params: AccountListsParams): Promise<PaginatedResponse<AccountListItem>> {
		const { account_id, ...rest } = params;
		return this.client.request<PaginatedResponse<AccountListItem>>(
			this.accountSubPath(account_id, ENDPOINTS.ACCOUNT.LISTS),
			rest,
		);
	}
}
