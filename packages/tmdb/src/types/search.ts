import { Keyword, KnownForItem } from "./common";
import { CountryISO3166_1, Language } from "./config";

/**
 * Collection information in search results
 */
export type CollectionResultItem = {
	/** Whether the collection contains adult content */
	adult: boolean;
	/** Path to backdrop image */
	backdrop_path: string;
	/** Unique collection identifier */
	id: number;
	/** Collection name (localized) */
	name: string;
	/** Original collection name in the original language */
	original_name: string;
	/** Original language of the collection (ISO 639-1 code) */
	original_language: string;
	/** Collection overview/description */
	overview: string;
	/** Path to poster image */
	poster_path?: string | null;
};

/**
 * Company information in search results
 */
export type CompanyResultItem = {
	/** Unique company identifier */
	id: number;
	/** Path to company logo image */
	logo_path?: string | null;
	/** Company name */
	name: string;
	/** ISO 3166-1 country code of company's origin */
	origin_country: CountryISO3166_1;
};

/**
 * Keyword information in search results
 */
export type KeywordResultItem = Keyword;

/**
 * Person information in search results
 */
export type PersonResultItem = {
	/** Whether the person is flagged as adult content creator */
	adult: boolean;
	/** Gender code: 0 = Not specified, 1 = Female, 2 = Male, 3 = Non-binary */
	gender: number;
	/** Unique person identifier */
	id: number;
	/** Primary department the person is known for (e.g. "Acting", "Directing") */
	known_for_department: string;
	/** Localized display name */
	name: string;
	/** Original name, typically in the person's native language */
	original_name: string;
	/** TMDB popularity score based on views, votes, and activity */
	popularity: number;
	/** Path to person's profile image */
	profile_path?: string | null;
	/** List of notable movies or TV shows the person is known for */
	known_for: KnownForItem[];
};

/**
 * A single TV series result as returned by TMDB APIs.
 *
 * Contains identifiers, localized and original titles, image path references,
 * release and origin information, genre ids, and popularity/vote statistics.
 * It is a partial representation of the TVDetails type.
 */
export type TVSeriesResultItem = {
	/** Relative path to the backdrop image for the series (nullable on some responses). */
	backdrop_path?: string | null;
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
	poster_path?: string | null;
	/** Average vote score for the series. */
	vote_average: number;
	/** Total number of votes the series has received. */
	vote_count: number;
	/** Original (non-localized) title of the series. */
	original_name: string;
};

/**
 * Simplified movie information used in lists and search results
 */
export type MovieResultItem = {
	/** Path to backdrop image */
	backdrop_path?: string | null;
	/** Unique movie identifier */
	id: number;
	/** Movie title (localized) */
	title: string;
	/** Original title in the original language */
	original_title: string;
	/** Plot synopsis/overview */
	overview: string;
	/** Path to poster image */
	poster_path?: string | null;
	/** Whether the movie is marked as adult content */
	adult: boolean;
	/** Original language of the movie (ISO 639-1 code) */
	original_language: string;
	/** Array of genre IDs (use /genre/movie/list to map to names) */
	genre_ids: number[];
	/** Popularity score calculated by TMDB */
	popularity: number;
	/** Release date in ISO 8601 format (YYYY-MM-DD) */
	release_date: string;
	/** Whether a video is available on TMDB */
	video: boolean;
	/** Average user rating (0-10 scale) */
	vote_average: number;
	/** Total number of votes received */
	vote_count: number;
};

/**
 * A single result item from the multi-search endpoint.
 * Discriminated on `media_type`.
 */
export type MultiSearchResultItem =
	| (MovieResultItem & { media_type: "movie" })
	| (TVSeriesResultItem & { media_type: "tv" })
	| (PersonResultItem & { media_type: "person" });

// MARK: Parameters

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

/**
 * Parameters for searching TV series
 */
export type SearchTVSeriesParams = {
	/** Search query text */
	query: string;
	/** Include adult (18+) content in results (default: false) */
	include_adult?: boolean;
	/** ISO 639-1 language code with optional region (e.g., "en-US") */
	language?: Language;
	/** Page number for paginated results (default: 1) */
	page?: number;
	/** Filter by first air date year (1000–9999) */
	first_air_date_year?: number;
	/** Filter by any air date year, including episodes (1000–9999) */
	year?: number;
};

/**
 * Parameters for multi-search (movies, TV shows, and people in a single request)
 */
export type SearchMultiParams = Pick<SearchTVSeriesParams, "query" | "include_adult" | "language" | "page">;
