import { CountryISO3166_1, Language } from "../config";

/**
 * Parameters for searching movies
 */
export type SearchMoviesParams = {
	/** Search query text */
	query: string;
	/** Include adult (18+) content in results (default: false) */
	include_adult?: boolean;
	/** ISO 639-1 language code with optional region (e.g., "en-US") */
	language?: Language;
	/** Page number for paginated results (default: 1) */
	page?: number;
	/** Filter results by primary release year (YYYY format) */
	primary_release_year?: string;
	/** ISO 3166-1 country code to filter results by region */
	region?: CountryISO3166_1;
	/** Filter results by any release year (YYYY format) */
	year?: string;
};

/**
 * Parameters for searching collections
 */
export type SearchCollectionsParams = Omit<SearchMoviesParams, "primary_release_year" | "year">;

/**
 * Parameters for searching keywords
 */
export type SearchKeywordsParams = Pick<SearchMoviesParams, "query" | "page">;

/**
 * Parameters for searching companies
 */
export type SearchCompanyParams = Pick<SearchMoviesParams, "query" | "page">;

/**
 * Parameters for searching people
 */
export type SearchPersonParams = Pick<SearchMoviesParams, "query" | "page" | "include_adult" | "language">;
