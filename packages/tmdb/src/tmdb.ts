// src.tmdb.ts

import { ApiClient } from "./client";
import { CertificationsAPI } from "./endpoints/certifications";
import { ChangesAPI } from "./endpoints/changes";
import { CompaniesAPI } from "./endpoints/companies";
import { CreditsAPI } from "./endpoints/credits";
import { CollectionsAPI } from "./endpoints/collections";
import { ConfigurationAPI } from "./endpoints/configuration";
import { DiscoverAPI } from "./endpoints/discover";
import { FindAPI } from "./endpoints/find";
import { GenresAPI } from "./endpoints/genres";
import { KeywordsAPI } from "./endpoints/keywords";
import { MovieListsAPI } from "./endpoints/movie_lists";
import { MoviesAPI } from "./endpoints/movies";
import { SearchAPI } from "./endpoints/search";
import { TVSeriesAPI } from "./endpoints/tv_series";
import { TVSeriesListsAPI } from "./endpoints/tv_series_lists";
import { WatchProvidersAPI } from "./endpoints/watch_providers";
import { Errors } from "./errors/messages";
import { ImageAPI } from "./images/images";
import { TMDBOptions } from "./types/config";
import { NetworksAPI } from "./endpoints/networks";
import { TVEpisodesAPI } from "./endpoints/tv_episodes";
import { TVEpisodeGroupsAPI } from "./endpoints/tv_episode_groups";
import { TVSeasonsAPI } from "./endpoints/tv_seasons";
import { TrendingAPI } from "./endpoints/trending";
import { ReviewsAPI } from "./endpoints/reviews";
import { PeopleListsAPI } from "./endpoints/people_lists";
import { PeopleAPI } from "./endpoints/people";
import { AccountAPI } from "./endpoints/account";
import { AuthenticationAPI } from "./endpoints/authentication";
import { GuestSessionsAPI } from "./endpoints/guest_sessions";
import { ListsAPI } from "./endpoints/lists";
import { TMDBv4 } from "./tmdb.v4";
import { isJwt } from "./utils";

export class TMDB {
	private client: ApiClient;
	private accessToken: string;
	private options: TMDBOptions; // ** Default options for all requests
	public movies: MoviesAPI;
	public movie_lists: MovieListsAPI;
	public search: SearchAPI;
	public images: ImageAPI;
	public configuration: ConfigurationAPI;
	public genres: GenresAPI;
	public keywords: KeywordsAPI;
	public tv_lists: TVSeriesListsAPI;
	public tv_series: TVSeriesAPI;
	public watch_providers: WatchProvidersAPI;
	public certifications: CertificationsAPI;
	public changes: ChangesAPI;
	public companies: CompaniesAPI;
	public credits: CreditsAPI;
	public collections: CollectionsAPI;
	public discover: DiscoverAPI;
	public find: FindAPI;
	public networks: NetworksAPI;
	public tv_episodes: TVEpisodesAPI;
	public tv_episode_groups: TVEpisodeGroupsAPI;
	public tv_seasons: TVSeasonsAPI;
	public trending: TrendingAPI;
	public reviews: ReviewsAPI;
	public people_lists: PeopleListsAPI;
	public people: PeopleAPI;
	public account: AccountAPI;
	public authentication: AuthenticationAPI;
	public guest_sessions: GuestSessionsAPI;
	public lists: ListsAPI;
	/**
	 * TMDB API v4 namespaces. Access via `tmdb.v4.auth`, `tmdb.v4.account`, `tmdb.v4.lists`.
	 * Requires a Bearer (JWT) access token — throws if the instance was created with an API key.
	 */
	get v4(): TMDBv4 {
		if (!isJwt(this.accessToken)) throw new Error(Errors.V4_REQUIRES_JWT);
		if (!this._v4) this._v4 = new TMDBv4(this.accessToken, this.options);
		return this._v4;
	}
	private _v4: TMDBv4 | undefined;

	/**
	 * Response cache controls. Only available when `cache` was set in the constructor options.
	 *
	 * - `clear()` — remove all cached entries (e.g. after a user signs out or state resets).
	 * - `invalidate(endpoint, params?)` — remove a single entry by endpoint + params.
	 * - `size` — number of entries currently held in memory.
	 *
	 * @example
	 * ```ts
	 * // Invalidate now_playing after a mutation
	 * tmdb.cache?.invalidate("/movie/now_playing");
	 *
	 * // Clear everything
	 * tmdb.cache?.clear();
	 * ```
	 */
	get cache():
		| { clear(): void; invalidate(endpoint: string, params?: Record<string, unknown>): boolean; readonly size: number }
		| undefined {
		if (!this.options.cache) return undefined;
		const client = this.client;
		return {
			clear() {
				client.clearCache();
			},
			invalidate(endpoint, params) {
				return client.invalidateCache(endpoint, params);
			},
			get size() {
				return client.cacheSize;
			},
		};
	}

	/**
	 * Creates a new TMDB instance.
	 * @param accessToken The TMDB API access token.
	 * @param options Optional default options (e.g., language) for all requests.
	 */
	constructor(accessToken: string, options: TMDBOptions = {}) {
		if (!accessToken) throw new Error(Errors.NO_ACCESS_TOKEN);
		this.accessToken = accessToken;
		this.options = options;
		this.client = new ApiClient(accessToken, {
			logger: options.logger,
			deduplication: options.deduplication,
			images: options.images,
			rate_limit: options.rate_limit,
			cache: options.cache,
			interceptors: options.interceptors,
		});
		this.movies = new MoviesAPI(this.client, this.options);
		this.movie_lists = new MovieListsAPI(this.client, this.options);
		this.search = new SearchAPI(this.client, this.options);
		this.images = new ImageAPI(this.options.images);
		this.configuration = new ConfigurationAPI(this.client, this.options);
		this.genres = new GenresAPI(this.client, this.options);
		this.keywords = new KeywordsAPI(this.client, this.options);
		this.tv_lists = new TVSeriesListsAPI(this.client, this.options);
		this.tv_series = new TVSeriesAPI(this.client, this.options);
		this.watch_providers = new WatchProvidersAPI(this.client, this.options);
		this.certifications = new CertificationsAPI(this.client, this.options);
		this.changes = new ChangesAPI(this.client, this.options);
		this.companies = new CompaniesAPI(this.client, this.options);
		this.credits = new CreditsAPI(this.client, this.options);
		this.collections = new CollectionsAPI(this.client, this.options);
		this.discover = new DiscoverAPI(this.client, this.options);
		this.find = new FindAPI(this.client, this.options);
		this.networks = new NetworksAPI(this.client, this.options);
		this.tv_episodes = new TVEpisodesAPI(this.client, this.options);
		this.tv_episode_groups = new TVEpisodeGroupsAPI(this.client, this.options);
		this.tv_seasons = new TVSeasonsAPI(this.client, this.options);
		this.trending = new TrendingAPI(this.client, this.options);
		this.reviews = new ReviewsAPI(this.client, this.options);
		this.people_lists = new PeopleListsAPI(this.client, this.options);
		this.people = new PeopleAPI(this.client, this.options);
		this.account = new AccountAPI(this.client, this.options);
		this.authentication = new AuthenticationAPI(this.client, this.options);
		this.guest_sessions = new GuestSessionsAPI(this.client, this.options);
		this.lists = new ListsAPI(this.client, this.options);
	}
}
