import { CountryISO3166_1 } from "../config/countries";
import { Language } from "../config/languages";

/**
 * Most of the commonly used params for
 * TMDB queries. Defined here for reuse.
 */
export type TMDBQueryParams = {
	language?: Language;
	page?: number;
	region?: CountryISO3166_1;
};

/** Generic utility */
export type WithParams<T extends keyof TMDBQueryParams> = Pick<TMDBQueryParams, T>;

export type WithLanguage = WithParams<"language">;
export type WithPage = WithParams<"page">;
export type WithRegion = WithParams<"region">;
export type WithLanguagePage = WithParams<"language" | "page">;
