import {
	AlternativeTitle,
	Cast,
	Changes,
	ContentRating,
	Credit,
	Crew,
	DateRange,
	Genre,
	ImageItem,
	ImagesResult,
	Keyword,
	PaginatedResponse,
	ProductionCompany,
	ProductionCountry,
	Review,
	SpokenLanguage,
	TranslationResults,
	WithLanguage,
	WithLanguagePage,
	WithParams,
} from "./common";
import { CountryISO3166_1 } from "./config/countries";
import { NetworkItem } from "./networks";
import { VideoItem } from "./common";
import { Language, LanguageISO6391, Timezone } from "./config";
import { TVSeriesResultItem } from "./search";
import { Prettify } from "./utility";

// MARK: Details

/**
 * Represent the detailed information about a TV show.
 */
export type TVSeriesDetails = {
	/** The path to the backdrop image, or null if not available */
	backdrop_path?: string;
	/** Array of creators who developed the TV show */
	created_by: Pick<Credit, "id" | "credit_id" | "gender" | "name" | "profile_path">[];
	/** Array of typical episode runtimes in minutes */
	episode_run_time: number[];
	/** The date the first episode aired */
	first_air_date: string;
	/** Array of genres associated with the TV show */
	genres: Genre[];
	/** The official homepage URL for the TV show, or null if not available */
	homepage?: string;
	/** The unique identifier for the TV show */
	id: number;
	/** Indicates whether the TV show is currently in production */
	in_production: boolean;
	/** Array of language codes used in the TV show */
	languages: string[];
	/** The date the most recent episode aired */
	last_air_date: string;
	/** Details of the last episode that aired, if available */
	last_episode_to_air?: TVEpisodeItem;
	/** The title of the TV show */
	name: string;
	/** Details of the next episode to air, if available */
	next_episode_to_air?: TVEpisodeItem;
	/** Array of networks that broadcast the TV show */
	networks?: NetworkItem[];
	/** The total number of episodes across all seasons */
	number_of_episodes: number;
	/** The total number of seasons */
	number_of_seasons: number;
	/** Array of country codes where the show originated (ISO 3166-1 format) */
	origin_country: CountryISO3166_1[];
	/** The original language code of the TV show */
	original_language: string;
	/** The original title of the TV show */
	original_name: string;
	/** A brief description or summary of the TV show, or null if not available */
	overview?: string;
	/** The popularity score of the TV show */
	popularity: number;
	/** The path to the poster image, or null if not available */
	poster_path?: string;
	/** Array of companies that produced the TV show */
	production_companies?: ProductionCompany[];
	/** Array of countries where the TV show was produced */
	production_countries?: ProductionCountry[];
	/** Array of all seasons in the TV show */
	seasons?: TVSeasonItem[];
	/** Array of languages spoken in the TV show with full names */
	spoken_languages?: SpokenLanguage[];
	/** The current status of the TV show (e.g., "Returning Series", "Ended") */
	status?: string;
	/** The type of TV show (e.g., "Scripted", "Documentary", "Reality") */
	type?: string;
	/** The average rating score for the TV show (0-10 scale) */
	vote_average: number;
	/** The total number of votes received for the TV show */
	vote_count: number;
};

export type TVEpisodeItem = {
	/** The unique identifier for the episode */
	id: number;
	/** The title of the episode */
	name: string;
	/** A brief description or summary of the episode's plot */
	overview: string;
	/** The average rating score for the episode (0-10 scale) */
	vote_average: number;
	/** The total number of votes received for the episode */
	vote_count: number;
	/** The date the episode first aired */
	air_date?: string;
	/** The episode number within its season */
	episode_number: number;
	/** The production code used internally during filming */
	production_code?: string;
	/** The runtime of the episode in minutes */
	runtime?: number;
	/** The season number this episode belongs to */
	season_number: number;
	/** The unique identifier of the TV show this episode belongs to */
	show_id: number;
	/** The path to the episode's still image (screenshot) */
	still_path?: string;
};

export type TVSeasonItem = {
	/** The date the season first aired, or null if not available */
	air_date?: string;
	/** The total number of episodes in the season */
	episode_count: number;
	/** The unique identifier for the season */
	id: number;
	/** The title of the season */
	name: string;
	/** A brief description or summary of the season */
	overview: string;
	/** The path to the season's poster image, or null if not available */
	poster_path?: string;
	/** The season number within the TV show */
	season_number: number;
};

/**
 * Available append-to-response options for TV show details.
 * These allow fetching additional related data in a single API request.
 */
export type TVAppendToResponseNamespace =
	| "credits"
	| "external_ids"
	| "images"
	| "keywords"
	| "recommendations"
	| "similar"
	| "translations"
	| "videos";

/**
 * Maps append-to-response keys to their corresponding response types.
 */
export type TVAppendableMap = {
	credits: TVCredits;
	external_ids: TVExternalIDs;
	images: TVImages;
	keywords: TVKeywords;
	recommendations: TVRecommendations;
	similar: TVSimilar;
	translations: TVTranslations;
	videos: TVVideos;
};

/**
 * TV show details with additional appended data based on the requested namespaces.
 * @template T - Array of append-to-response namespace keys to include
 */
export type TVDetailsWithAppends<T extends readonly TVAppendToResponseNamespace[]> = TVSeriesDetails & {
	[K in T[number]]: TVAppendableMap[K];
};

// MARK: Aggreate Credits

/**
 * Aggregate credits for a TV show, including cast and crew across all seasons and episodes.
 */
export type TVAggregateCredits = {
	/** TMDB unique identifier for the TV show. */
	id: number;
	/** List of all the known cast for the TV show. */
	cast: TVAggregateCreditsCastItem[];
	/** List of all the known crew members for the TV show. */
	crew: TVAggregateCreditsCrewItem[];
};

/**
 * Cast member in TV show aggregate credits with their roles across all seasons.
 */
export type TVAggregateCreditsCastItem = Omit<Credit, "credit_id"> & {
	/** Array of roles played by this cast member across different episodes */
	roles: TVCreditRole[];
	/** Total number of episodes this cast member appeared in */
	total_episode_count: number;
	/** Position in the cast list */
	order: number;
};

/**
 * Crew member in TV show aggregate credits with their jobs across all seasons.
 */
export type TVAggregateCreditsCrewItem = Omit<Credit, "credit_id"> & {
	/** Array of jobs performed by this crew member across different episodes */
	jobs: TVCreditJob[];
	/** Total number of episodes this crew member worked on */
	total_episode_count: number;
	/** Department the crew member belongs to (e.g., "Directing", "Writing") */
	department: string;
};

/**
 * Represents a specific role a cast member played in a TV show.
 */
export type TVCreditRole = {
	/** Unique identifier for this specific credit */
	credit_id: string;
	/** Character name played in this role */
	character: string;
	/** Number of episodes in which this character appeared */
	episode_count: number;
};

/**
 * Represents a specific job a crew member performed on a TV show.
 */
export type TVCreditJob = {
	/** Unique identifier for this specific credit */
	credit_id: string;
	/** Job title (e.g., "Director", "Writer", "Producer") */
	job: string;
	/** Number of episodes for which this job was performed */
	episode_count: number;
};

// MARK: Alternative Titles

/**
 * Alternative titles for a tv show in different countries/languages
 */
export type TVAlternativeTitles = {
	/** Movie identifier */
	id: number;
	/** Array of alternative titles */
	results: AlternativeTitle[];
};

// MARK: Changes

export type TVSeriesChanges = Changes;

// MARK: Content Ratings

export type TVContentRatings = {
	results: ContentRating[];
};

// Mark: Credits

/**
 * This is the original TV credits method which returns the latest season credit data.
 * If you would like to request the aggregate view (which is what you see on the TMDB website)
 * you should use the aggregate_credits method.
 */
export type TVCredits = {
	/** TMDB unique identifier for the TV show. */
	id: number;
	/** List of all the known cast for the TV show. */
	cast: Cast[];
	/** List of all the known crew members for the TV show. */
	crew: Crew[];
};

// MARK: Episode Groups

/**
 * Collection of episode groups for a TV series
 */
export type TVEpisodeGroups = {
	/** TV series identifier */
	id: number;
	/** Array of episode group items */
	results: TVEpisodeGroupItem[];
};

/**
 * Alternative grouping of episodes (e.g., chronological order, director's cut)
 */
export type TVEpisodeGroupItem = {
	/** Description explaining the purpose of this episode grouping */
	description: string;
	/** Total number of episodes in this group */
	episode_count: number;
	/** Number of sub-groups within this episode group */
	group_count: number;
	/** Unique episode group identifier */
	id: string;
	/** Name of the episode group */
	name: string;
	/** Network that created or distributed this episode grouping */
	network: NetworkItem;
	/** Type of grouping (1=Original air date, 2=Absolute, 3=DVD, 4=Digital, 5=Story arc, 6=Production, 7=TV) */
	type: number;
};

// MARK: External IDs

/**
 * External platform identifiers for a TV series
 */
export type TVExternalIDs = {
	/** TV series identifier in TMDB */
	id: number;
	/** IMDb identifier (e.g., "tt0944947"), null if not available */
	imdb_id?: string;
	/** Freebase MID identifier (deprecated), null if not available */
	freebase_mid?: string;
	/** Freebase ID (deprecated), null if not available */
	freebase_id?: string;
	/** TheTVDB identifier, null if not available */
	tvdb_id?: number;
	/** TVRage identifier (service discontinued), null if not available */
	tvrage_id?: number;
	/** Wikidata identifier (e.g., "Q23572"), null if not available */
	wikidata_id?: string;
	/** Facebook page identifier, null if not available */
	facebook_id?: string;
	/** Instagram handle, null if not available */
	instagram_id?: string;
	/** Twitter/X handle, null if not available */
	twitter_id?: string;
};

// MARK: Images

/**
 * Images related to a TV show.
 * Contains backdrops, logos, posters and stills.
 */
export type TVImages = ImagesResult<TVImageItem, "backdrops" | "logos" | "posters">;

/**
 * Image items for TVShows have an undocumented "iso_3166_1" property
 * I decided to put it anyway as an optional property,
 * but only for tv shows images.
 */
export type TVImageItem = ImageItem & { iso_3166_1?: string };

// MARK: Keywords

/**
 * List of keywords related to the TV show.
 */
export type TVKeywords = {
	/** TMDB unique identifier for the TV show. */
	id: number;
	/** List of keywords related to the TV show. */
	results: Keyword[];
};

// MARK: Lists

/**
 * Represents a paginated collection of TV series lists, extended with a unique identifier.
 * Combines a standard `PaginatedResponse<TVSeriesListItem>` with an `id` field
 * that uniquely identifies the tv show.
 */
export type TVSeriesLists = PaginatedResponse<TVSeriesListItem> & { id: number };

/**
 * Represents a single TV series list entry as returned by the TMDB API.
 */
export type TVSeriesListItem = {
	/** A brief description of the list provided by its creator. */
	description: string;
	/** The number of times this list has been marked as a favorite by TMDB users. */
	favorite_count: number;
	/** The unique identifier for this list on TMDB. */
	id: number;
	/** The total number of items (TV series) currently in this list. */
	item_count: number;
	/** The primary language of the list content as an ISO 639-1 code (e.g. `"en"`). */
	iso_639_1: string | LanguageISO6391;
	/** The country associated with the list as an ISO 3166-1 alpha-2 code (e.g. `"US"`). */
	iso_3166_1: string | CountryISO3166_1;
	/** The display name of the list. */
	name: string;
	/** Path to the list's poster image on the TMDB CDN. Combine with a base URL to get the full image path. */
	poster_path?: string;
};

// MARK: Reccomendations

/** List of TV shows that are recommended for a TV show. */
export type TVRecommendations = PaginatedResponse<TVSeriesResultItem>;

// MARK: Reviews

/**
 * Paginated list of user reviews for a tv show
 */
export type TVReviews = PaginatedResponse<Review>;

// MARK: Screened Theatrically

/**
 * Represents the response for TV episodes that have been screened theatrically.
 */
export type TVScreenedTheatrically = {
	/** The unique identifier of the TV series. */
	id: number;
	/** The list of episodes that received a theatrical screening. */
	results: TVScreeningItem[];
};

/**
 * Represents a single TV episode that was screened theatrically.
 */
export type TVScreeningItem = {
	/** The unique identifier of the episode. */
	id: number;
	/** The episode number within its season. */
	episode_number: number;
	/** The season number the episode belongs to. */
	season_number: number;
};

// MARK: Similar

/** List of TV shows that are similar to a TV show. */
export type TVSimilar = PaginatedResponse<TVSeriesResultItem>;

// MARK: Translations

/**
 * Represents the collection of available translations for a TV series.
 */
export type TVTranslations = TranslationResults<TVTranslationData>;

/**
 * The translated text fields for a TV series in a specific language.
 * All fields are optional as not every translation may provide all values.
 */
export type TVTranslationData = {
	/** The translated name of the TV series. */
	name?: string;
	/** The translated overview or synopsis of the TV series. */
	overview?: string;
	/** The translated homepage URL for the TV series. */
	homepage?: string;
	/** The translated tagline of the TV series. */
	tagline?: string;
};

// MARK: Videos

/** List of videos related to a TV show. */
export type TVVideos = {
	/** TMDB unique identifier for the TV show. */
	id: number;

	/** List of video results. */
	results: VideoItem[];
};

// MARK: Parameters

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
export type TVCreditsParams = Prettify<TVBaseParam & WithLanguage>;

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
		/** Languages to include images for. Pass an array — it will be serialized as a comma-separated list (e.g. ["en", "null"]). Use "null" to include untagged images. */
		include_image_language?: (Language | "null")[];
	}
>;

/**
 * Parameters for fetching TV series lists (lists endpoint, different from airing_today ecc...).
 */
export type TVSeriesListsParams = Prettify<TVBaseParam & WithLanguagePage>;

/**
 * Parameters for fetching tv shows recommendations.
 */
export type TVRecommendationsParams = Prettify<TVBaseParam & WithLanguagePage>;

/**
 * Parameters for fetching similar tv shows.
 */
export type TVSimilarParams = Prettify<TVBaseParam & WithLanguagePage>;

/**
 * Parameters for fetching tv show reviews.
 */
export type TVReviewsParams = Prettify<TVBaseParam & WithLanguagePage>;
