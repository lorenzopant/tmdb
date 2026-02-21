import { CountryISO3166_1 } from "../config";

/**
 * A single TV series result as returned by TMDB APIs.
 *
 * Contains identifiers, localized and original titles, image path references,
 * release and origin information, genre ids, and popularity/vote statistics.
 * It is a partial representation of the TVDetails type.
 */
export type TVSeriesResultItem = {
	/** Relative path to the backdrop image for the series (nullable on some responses). */
	backdrop_path: string;
	/** First air date of the series (YYYY-MM-DD). */
	first_air_date: string;
	/** Array of genre ids associated with the series. */
	genre_ids: number[];
	/** Unique TMDB id for the series. */
	id: number;
	/** Series name (localized). */
	name: string;
	/** Origin country codes for the series (ISO 3166-1). */
	origin_country: CountryISO3166_1[];
	/** Original language code (ISO 639-1). */
	original_language: string;
	/** Brief synopsis/overview of the series. */
	overview: string;
	/** Popularity score as returned by TMDB. */
	popularity: number;
	/** Relative path to the poster image for the series (nullable on some responses). */
	poster_path: string;
	/** Average vote score for the series. */
	vote_average: number;
	/** Total number of votes the series has received. */
	vote_count: number;
	/** Localized or display title for the series (may match name). */
	title: string;
	/** Original (non-localized) title of the series. */
	original_title: string;
};
