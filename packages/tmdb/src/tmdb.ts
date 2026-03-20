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

export class TMDB {
	private client: ApiClient;
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
	// etc...

	/**
	 * Creates a new TMDB instance.
	 * @param accessToken The TMDB API access token.
	 * @param options Optional default options (e.g., language) for all requests.
	 */
	constructor(accessToken: string, options: TMDBOptions = {}) {
		if (!accessToken) throw new Error(Errors.NO_ACCESS_TOKEN);
		this.options = options;
		this.client = new ApiClient(accessToken, { logger: options.logger });
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
	}
}
