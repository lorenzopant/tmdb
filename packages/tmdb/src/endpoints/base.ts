import { ApiClient } from "../client";
import { Language } from "../types";
import { TMDBOptions } from "../types/config";
import { Errors } from "../errors/messages";

export abstract class TMDBAPIBase {
	protected client: ApiClient;
	protected defaultOptions: TMDBOptions;

	constructor(accessTokenOrClient: string | ApiClient, defaultOptions: TMDBOptions = {}) {
		if (typeof accessTokenOrClient === "string") {
			if (!accessTokenOrClient) throw new Error(Errors.NO_ACCESS_TOKEN);
			this.client = new ApiClient(accessTokenOrClient, {
				logger: defaultOptions.logger,
				deduplication: defaultOptions.deduplication,
				rate_limit: defaultOptions.rate_limit,
				interceptors: defaultOptions.interceptors,
			});
		} else if (accessTokenOrClient instanceof ApiClient) {
			this.client = accessTokenOrClient;
		} else {
			throw new Error(accessTokenOrClient == null ? Errors.NO_ACCESS_TOKEN : Errors.INVALID_CLIENT);
		}
		this.defaultOptions = defaultOptions;
	}

	/**
	 * Merges the endpoint's params with TMDB-wide defaults (language, region).
	 * Works only for param types that include optional `language` and `region` fields.
	 * Only request-safe defaults are merged — config-only options (logger, images, etc.) are excluded.
	 */
	protected applyDefaults<T extends object>(params?: T): T | undefined {
		const { language, region } = this.defaultOptions;
		return {
			...(language !== undefined && { language }),
			...(region !== undefined && { region }),
			...params,
		} as T;
	}

	/**
	 * Ensures params contains a language: prefer explicit param, fallback to defaultOptions.language.
	 * If neither is present, returns the original params unmodified.
	 * When params is undefined but a default language is set, returns { language: defaultLang }.
	 */
	protected withLanguage<T extends { language?: Language }>(params?: T): T | undefined {
		const defaultLang = this.defaultOptions?.language;
		if (!params) return defaultLang !== undefined ? ({ language: defaultLang } as T) : undefined;
		if (params.language !== undefined) return params;
		if (defaultLang === undefined) return params;
		return { ...params, language: defaultLang } as T;
	}
}
