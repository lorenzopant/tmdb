import { Timezone } from "../config/timezones";
import { TVAppendToResponseNamespace } from "./tv_series";
import { Prettify } from "../utility";
import { DateRange, WithLanguagePage, WithParams } from "../common/params";
import { Language, LanguageISO6391 } from "../config";

/**
 * Almost every query within the TV Series domain
 * will take this required param to identify the
 * tv show.
 */
export type TVBaseParam = { series_id: number };

/**
 * Parameters for TV series list endpoints (popular, top rated, airing today, on the air).
 */
export type TVSeriesListParams = Prettify<WithLanguagePage & { timezone?: Timezone }>;

/**
 * Parameters for fetching TV show details with optional additional data appended.
 */
export type TVDetailsParams = Prettify<TVBaseParam & { append_to_response?: TVAppendToResponseNamespace[] } & WithParams<"language">>;

/**
 * Parameters for fetching aggregate credits for a TV show (cast and crew across all seasons).
 */
export type TVAggregateCreditsParams = Prettify<TVBaseParam & WithParams<"language">>;

/**
 * Parameters for fetching tv show change history.
 */
export type TVChangeParams = Prettify<TVBaseParam & WithParams<"page"> & DateRange>;

/**
 * Parameters for fetching tv show credits (cast and crew last season).
 */
export type TVCreditsParams = Prettify<TVBaseParam & WithParams<"language">>;

/**
 * Parameters for fetching tv shows images (backdrops, logos, posters).
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
export type TVImagesParams = Prettify<
	TVBaseParam & {
		/** Language for image metadata (supports both ISO-639-1 and full Language format) */
		language?: Language | LanguageISO6391;
		/** Include images with specific language tags (comma-separated, e.g., "en,null") */
		include_image_language?: Language | LanguageISO6391;
	}
>;

/**
 * Parameters for fetching TV series lists (lists endpoint, different from airing_today ecc...).
 */
export type TVSeriesListsParams = TVBaseParam & WithLanguagePage;
