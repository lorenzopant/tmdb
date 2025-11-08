import { ApiClient } from "../client";
import { TMDBOptions } from "../types";

export abstract class TMDBAPIBase {
	protected client: ApiClient;
	protected defaultOptions: TMDBOptions;

	constructor(client: ApiClient, defaultOptions: TMDBOptions = {}) {
		this.client = client;
		this.defaultOptions = defaultOptions;
	}

	/**
	 * Merges the endpoint's params with TMDB-wide defaults (language, region).
	 * Works only for param types that include optional `language` and `region` fields.
	 */
	protected applyDefaults<T extends object>(params: T): T {
		return { ...this.defaultOptions, ...params };
	}
}
