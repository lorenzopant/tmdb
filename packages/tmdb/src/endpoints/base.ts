import { ApiClient } from "../client";
import { Language } from "../types";
import { TMDBOptions } from "../types/config";

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
	 * Only request-safe defaults are merged — config-only options (logger, images, etc.) are excluded.
	 */
	protected applyDefaults<T extends object>(params?: T): T | undefined {
		const { language, region } = this.defaultOptions;
		return { ...(language !== undefined && { language }), ...(region !== undefined && { region }), ...params } as T;
	}

	/**
	 * Ensures params contains a language: prefer explicit param, fallback to defaultOptions.language.
	 * If neither is present, returns the original params unmodified.
	 */
	protected withLanguage<T extends { language?: Language }>(params?: T): T | undefined {
		if (!params) return undefined; // Handle undefined params
		if (params.language !== undefined) return params;
		const defaultLang = this.defaultOptions?.language;
		if (defaultLang === undefined) return params;
		return { ...params, language: defaultLang } as T;
	}
}
