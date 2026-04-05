// src/tmdb.v4.ts

import { ApiClient } from "./client";
import { V4AuthAPI } from "./endpoints/v4/auth";
import { V4AccountAPI } from "./endpoints/v4/account";
import { V4ListsAPI } from "./endpoints/v4/lists";
import type { TMDBOptions } from "./types/config";
import { Errors } from "./errors/messages";

/**
 * Aggregator for all TMDB API v4 namespaces.
 *
 * Access via `tmdb.v4` — the v4 client is backed by `https://api.themoviedb.org/4`
 * and inherits the same access token and options as the parent TMDB instance.
 *
 * @example
 * ```ts
 * const tmdb = new TMDB(accessToken);
 *
 * // v4 auth flow
 * const { request_token } = await tmdb.v4.auth.create_request_token();
 * // ... user approves at https://www.themoviedb.org/auth/access?request_token=...
 * const { access_token, account_id } = await tmdb.v4.auth.create_access_token({ request_token });
 *
 * // v4 account (account_id is a string from the access token response)
 * const profile   = await tmdb.v4.account.details(account_id);
 * const favorites = await tmdb.v4.account.favorite_movies({ account_id, page: 1 });
 *
 * // v4 lists (full CRUD)
 * const list = await tmdb.v4.lists.create({ name: "My list", iso_639_1: "en" });
 * await tmdb.v4.lists.add_items(list.id, { items: [{ media_type: "movie", media_id: 550 }] });
 * ```
 */
export class TMDBv4 {
	private client: ApiClient;

	/** v4 authentication — request token → access token → logout. */
	public auth: V4AuthAPI;
	/** v4 account — details, lists, favorites, watchlist, rated. */
	public account: V4AccountAPI;
	/** v4 lists — full CRUD for user-created lists. */
	public lists: V4ListsAPI;

	constructor(accessToken: string, options: TMDBOptions = {}) {
		if (!accessToken) throw new Error(Errors.NO_ACCESS_TOKEN);
		this.client = new ApiClient(accessToken, {
			version: 4,
			logger: options.logger,
			deduplication: options.deduplication,
			images: options.images,
			interceptors: options.interceptors,
		});
		this.auth = new V4AuthAPI(this.client, options);
		this.account = new V4AccountAPI(this.client, options);
		this.lists = new V4ListsAPI(this.client, options);
	}
}
