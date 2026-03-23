import {
	AlternativeTitle,
	Cast,
	Changes,
	Crew,
	DateRange,
	Genre,
	ImageItem,
	ImagesResult,
	Keyword,
	MovieCollection,
	PaginatedResponse,
	ProductionCompany,
	ProductionCountry,
	Review,
	SpokenLanguage,
	TMDBQueryParams,
	TranslationResults,
	VideoResults,
	WithLanguagePage,
	WithParams,
} from "./common";
import { CountryISO3166_1, Language, LanguageISO6391 } from "./config";
import { ReleaseType } from "./enums";
import { MovieResultItem } from "./search";
import { Prettify } from "./utility";

/**
 * Complete movie details with metadata, production info, and statistics
 */
export type MovieDetails = {
	/** Whether the movie is marked as adult content */
	adult: boolean;
	/** Path to backdrop image, null if not available */
	backdrop_path: string | null;
	/** Collection the movie belongs to (e.g., "The Lord of the Rings Collection"), null if standalone */
	belongs_to_collection: MovieCollection | null;
	/** Production budget in US dollars */
	budget: number;
	/** Array of genres associated with the movie */
	genres: Genre[];
	/** Official homepage URL, null if not available */
	homepage: string | null;
	/** Unique movie identifier in TMDB */
	id: number;
	/** IMDb identifier (e.g., "tt0133093"), null if not linked */
	imdb_id: string | null;
	/** Array of origin country codes (ISO 3166-1) */
	origin_country: string[];
	/** Original language of the movie (ISO 639-1 code) */
	original_language: string;
	/** Original title in the original language */
	original_title: string;
	/** Plot synopsis/overview, null if not available */
	overview: string | null;
	/** Popularity score calculated by TMDB */
	popularity: number;
	/** Path to poster image, null if not available */
	poster_path: string | null;
	/** Array of companies that produced the movie */
	production_companies: ProductionCompany[];
	/** Array of countries where the movie was produced */
	production_countries: ProductionCountry[];
	/** Release date in ISO 8601 format (YYYY-MM-DD) */
	release_date: string;
	/** Box office revenue in US dollars */
	revenue: number;
	/** Runtime in minutes, null if not set */
	runtime: number | null;
	/** Array of languages spoken in the movie */
	spoken_languages: SpokenLanguage[];
	/** Release status (e.g., "Released", "Post Production", "In Production") */
	status: string;
	/** Movie tagline/slogan, null if not available */
	tagline: string | null;
	/** Movie title (localized if language parameter was provided) */
	title: string;
	/** Whether a video is available on TMDB */
	video: boolean;
	/** Average user rating (0-10 scale) */
	vote_average: number;
	/** Total number of votes received */
	vote_count: number;
};

/**
 * Available endpoints that can be appended to movie details requests
 */
export type MovieAppendToResponseNamespace =
	| "alternative_titles"
	| "changes"
	| "credits"
	| "external_ids"
	| "images"
	| "keywords"
	| "recommendations"
	| "release_dates"
	| "reviews"
	| "similar"
	| "translations"
	| "videos";

/**
 * Mapping of append-to-response keys to their return types
 */
export type MovieAppendableMap = {
	alternative_titles: MovieAlternativeTitles;
	changes: MovieChanges;
	credits: MovieCredits;
	external_ids: MovieExternalIDs;
	images: MovieImages;
	keywords: MovieKeywords;
	recommendations: MovieRecommendations;
	release_dates: MovieReleaseDates;
	reviews: MovieReviews;
	similar: MovieSimilar;
	translations: MovieTranslations;
	videos: MovieVideos;
};

/**
 * Movie details with additional appended data
 * @template T - Array of namespace strings to append
 * @example
 * ```typescript
 * // Get movie details with credits and videos
 * const movie: MovieDetailsWithAppends<['credits', 'videos']> = await getMovie(550, {
 *   append_to_response: ['credits','videos']
 * });
 * ```
 */
export type MovieDetailsWithAppends<T extends readonly MovieAppendToResponseNamespace[]> = MovieDetails & {
	[K in T[number]]: MovieAppendableMap[K];
};

// MARK: Alternative Titles

/**
 * Alternative titles for a movie in different countries/languages
 */
export type MovieAlternativeTitles = {
	/** Movie identifier */
	id: number;
	/** Array of alternative titles */
	titles: AlternativeTitle[];
};

// MARK: Changes

export type MovieChanges = Changes;

// MARK: Credits

/**
 * Cast and crew credits for a movie
 */
export type MovieCredits = {
	/** Movie identifier */
	id: number;
	/** Array of cast members (actors) */
	cast: Cast[];
	/** Array of crew members (directors, writers, etc.) */
	crew: Crew[];
};

// MARK: External IDs

/**
 * External platform identifiers for a movie
 */
export type MovieExternalIDs = {
	/** Movie identifier in TMDB */
	id: number;
	/** IMDb identifier (e.g., "tt0133093"), null if not available */
	imdb_id?: string | null;
	/** Facebook page identifier, null if not available */
	facebook_id?: string | null;
	/** Twitter/X handle, null if not available */
	twitter_id?: string | null;
	/** Instagram handle, null if not available */
	instagram_id?: string | null;
};

// MARK: Images

/**
 * Collection of movie images (backdrops, logos, posters)
 */
export type MovieImages = ImagesResult<ImageItem, "backdrops" | "logos" | "posters">;

// MARK: Keywords

/**
 * Keywords/tags associated with a movie
 */
export type MovieKeywords = {
	/** Movie identifier */
	id: number;
	/** Array of keyword objects */
	keywords: Keyword[];
};

// MARK: Reccomendations

/**
 * Paginated list of recommended movies based on this movie
 */
export type MovieRecommendations = PaginatedResponse<MovieResultItem>;

// MARK: Release Dates

/**
 * Release dates and certifications across different countries
 */
export type MovieReleaseDates = {
	/** Movie identifier */
	id: number;
	/** Array of release date results grouped by country */
	results: MovieReleaseDateResult[];
};

/**
 * Release dates for a specific country
 */
export type MovieReleaseDateResult = {
	/** ISO 3166-1 country code */
	iso_3166_1: string;
	/** Array of release dates (movies can have multiple releases per country) */
	release_dates: MovieReleaseDate[];
};

/**
 * Individual release date entry with certification
 */
export type MovieReleaseDate = {
	/** Age certification/rating (e.g., "PG-13", "R", "12A") */
	certification: string;
	/** ISO 639-1 language code */
	iso_639_1: string;
	/** Release date and time in ISO 8601 format */
	release_date: string;
	/** Type of release (1=Premiere, 2=Theatrical (limited), 3=Theatrical, 4=Digital, 5=Physical, 6=TV) */
	type: ReleaseType | number;
	/** Additional notes about this release */
	note: string;
	/** Content descriptors (currently unused by TMDB) */
	descriptors: unknown[];
};

// MARK: Reviews

/**
 * Paginated list of user reviews for a movie
 */
export type MovieReviews = PaginatedResponse<Review>;

// MARK: Similar

/**
 * Paginated list of movies similar to this movie
 */
export type MovieSimilar = PaginatedResponse<MovieResultItem>;

// MARK: Translations

/**
 * Movie translations containing all available language versions
 */
export type MovieTranslations = TranslationResults<MovieTranslationData>;

/**
 * Translation data for a specific language
 */
export type MovieTranslationData = {
	/** Translated homepage URL */
	homepage?: string;
	/** Translated synopsis/overview */
	overview?: string;
	/** Movie runtime in minutes */
	runtime?: number;
	/** Translated tagline */
	tagline?: string;
	/** Translated movie title */
	title?: string;
};

// MARK: Videos

/**
 * Collection of videos (trailers, teasers, clips) for a movie
 */
export type MovieVideos = VideoResults;

// MARK: Parameters

/**
 * Parameters for movie list endpoints (popular, top rated, now playing, upcoming).
 */
export type MovieListParams = TMDBQueryParams;
/**
 * Almost every query within the Movie domain
 * will take this required param to identify the movie.
 */
type MovieBaseParam = { movie_id: number };

/**
 * Parameters for fetching movie details with optional additional data appended.
 */
export type MovieDetailsParams = Prettify<
	MovieBaseParam & {
		append_to_response?: MovieAppendToResponseNamespace | MovieAppendToResponseNamespace[];
	} & WithParams<"language">
>;

/**
 * Parameters for fetching alternative titles for a movie.
 */
export type MovieAlternativeTitlesParams = Prettify<MovieBaseParam & { country?: CountryISO3166_1 }>;

/**
 * Parameters for fetching movie credits (cast and crew).
 */
export type MovieCreditsParams = Prettify<MovieBaseParam & WithParams<"language">>;

/**
 * Parameters for fetching movie keywords.
 */
export type MovieKeywordsParams = MovieBaseParam;

/**
 * Parameters for fetching external IDs (IMDb, Facebook, Twitter, Instagram).
 */
export type MovieExternalIDsParams = MovieBaseParam;

/**
 * Parameters for fetching release dates and certifications.
 */
export type MovieReleaseDatesParams = MovieBaseParam;

/**
 * Parameters for fetching movie translations.
 */
export type MovieTranslationsParams = MovieBaseParam;

/**
 * Parameters for fetching watch provider availability.
 */
export type MovieWatchProvidersParams = MovieBaseParam;

/**
 * Parameters for fetching movie change history.
 */
export type MovieChangesParams = Prettify<MovieBaseParam & WithParams<"page"> & DateRange>;

/**
 * Parameters for fetching movie images (backdrops, logos, posters).
 *
 * Note: language and include_image_language params still only support
 * ISO-639-1 language definition according to TMDB docs:
 *
 * "These are all specified as IETF tags to identify the languages we use on TMDB.
 * There is one exception which is image languages.
 * They are currently only designated by a ISO-639-1 tag. This is a planned upgrade for the future."
 * https://developer.themoviedb.org/reference/configuration-primary-translations
 *
 * However, in practice, language in format "en-US" is still accepted.
 * So we allow for both formats.
 */
export type MovieImagesParams = Prettify<
	MovieBaseParam & {
		/** Language for image metadata (supports both ISO-639-1 and full Language format) */
		language?: Language | LanguageISO6391;
		/** Languages to include images for. Pass an array — it will be serialized as a comma-separated list (e.g. ["en", "null"]). Use "null" to include untagged images. */
		include_image_language?: (Language | "null")[];
	}
>;

/**
 * Parameters for fetching movie recommendations.
 */
export type MovieRecommendationsParams = Prettify<MovieBaseParam & WithLanguagePage>;

/**
 * Parameters for fetching similar movies.
 */
export type MovieSimilarParams = MovieRecommendationsParams;

/**
 * Parameters for fetching movie videos (trailers, teasers, clips).
 */
export type MovieVideosParams = Prettify<MovieBaseParam & WithParams<"language">>;

/**
 * Parameters for fetching movie reviews.
 */
export type MovieReviewsParams = Prettify<MovieBaseParam & WithLanguagePage>;
