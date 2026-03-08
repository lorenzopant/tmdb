import { TMDBQueryParams } from "../common";

/**
 * Base params used by keyword endpoints.
 */
export type KeywordBaseParam = {
	/** TMDB keyword identifier. */
	keyword_id: number;
};

/**
 * Parameters for fetching keyword details.
 */
export type KeywordDetailsParams = KeywordBaseParam;

/**
 * Parameters for fetching movies associated with a keyword.
 * @reference https://developer.themoviedb.org/reference/keyword-movies
 */
export type KeywordMoviesParams = KeywordBaseParam &
	Pick<TMDBQueryParams, "language" | "page"> & {
		include_adult?: boolean;
	};
