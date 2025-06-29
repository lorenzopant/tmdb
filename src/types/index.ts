import { CountryISO3166_1 } from "./countries";
import { LanguageISO6391 } from "./lang";

export * from "./common";
export * from "./countries";
export * from "./enums";
export * from "./lang";
export * from "./movies";
export * from "./params";
export * from "./utility";

export type TMDBOptions = {
	/**
	 * The language to use for requests (ISO 639-1 code)
	 * This provides localization and translated data.
	 */
	language?: LanguageISO6391;
	/**
	 * Region codes follow ISO 3166-1 (e.g. 'US', 'IT', 'JP') and are used to localize results.
	 * They affect release dates, age certifications, watch providers, and filtered movie lists.
	 * Example: 'region=IT' returns Italian-specific results for now playing, watch providers, etc.
	 * If not set, TMDB may fall back to a default or global data.
	 */
	region?: CountryISO3166_1;
};
