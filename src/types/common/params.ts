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

/**
 * Specify a date range with start and end date.
 */
export type DateRange = {
	/** Start date for changes in ISO 8601 format (YYYY-MM-DD) */
	start_date?: string;
	/** End date for changes in ISO 8601 format (YYYY-MM-DD) */
	end_date?: string;
};

/** Generic utility */
export type WithParams<T extends keyof TMDBQueryParams> = Pick<TMDBQueryParams, T>;

export type WithLanguage = WithParams<"language">;
export type WithPage = WithParams<"page">;
export type WithRegion = WithParams<"region">;
export type WithLanguagePage = WithParams<"language" | "page">;
