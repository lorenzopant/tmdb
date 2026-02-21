import { TMDBQueryParams, WithLanguagePage, WithParams } from "../common";
import { CountryISO3166_1 } from "../config/countries";
import { Language, LanguageISO6391 } from "../config/languages";
import { Prettify } from "../utility";
import { MovieAppendToResponseNamespace } from "./movie";

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
	MovieBaseParam & { append_to_response?: MovieAppendToResponseNamespace[] } & WithParams<"language">
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
export type MovieChangesParams = Prettify<
	MovieBaseParam &
		WithParams<"page"> & {
			/** Start date for changes in ISO 8601 format (YYYY-MM-DD) */
			start_date?: string;
			/** End date for changes in ISO 8601 format (YYYY-MM-DD) */
			end_date?: string;
		}
>;

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
		/** Include images with specific language tags (comma-separated, e.g., "en,null") */
		include_image_language?: Language | LanguageISO6391;
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
