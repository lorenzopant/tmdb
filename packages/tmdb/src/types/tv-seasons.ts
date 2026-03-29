import { Cast, Crew, DateRange, ImageItem, ImagesResult, TranslationResults, VideoResults, WithLanguage, WithParams } from "./common";
import { Language } from "./config";
import { TVAggregateCredits, TVBaseParam, TVEpisodeItem, TVExternalIDs } from "./tv-series";
import { MediaWatchProviders } from "./common/media";
import { NetworkItem } from "./networks";
import { LiteralUnion, Prettify } from "./utility";

/**
 * Almost every query within the TV Series Seasons domain
 * will take this required param to identify the
 * tv show season.
 */
export type TVSeasonBaseParams = TVBaseParam & {
	/** The Season */
	season_number: number;
};

/** Uniquely identifies a season across different tv shows. */
export type TVSeasonId = {
	season_id: string | number;
};

// MARK: Details

/**
 * Represents a single episode within a TV season from the TMDB API.
 * Extends {@link TVEpisodeItem} (rather than `TVEpisode`) with crew, guest stars, and episode type.
 *
 * NOTE: `TVEpisode` is intentionally not used here to avoid a circular dependency:
 * `tv-episodes.ts` imports `TVSeasonBaseParams` from this file, so importing
 * `TVEpisode` back would form a cycle. `TVEpisodeItem` carries the same scalar
 * fields (including `show_id`) and produces an identical runtime shape.
 */
export type TVSeasonEpisode = TVEpisodeItem & {
	/** Array of crew members for this episode */
	crew: Crew[];
	/** Episode type */
	episode_type: LiteralUnion<"standard" | "finale">;
	/** Array of guest stars in this episode */
	guest_stars: Omit<Cast, "cast_id">[];
};

/**
 * Detailed information about a TV season returned by the TMDB API.
 */
export type TVSeason = {
	/** ISO 8601 date when the season first aired */
	air_date?: string;
	/** Array of episodes in this season */
	episodes: TVSeasonEpisode[];
	/** Unique TMDB identifier for the season */
	id: number;
	/** Season name */
	name: string;
	/** Networks that broadcast this season */
	networks: NetworkItem[];
	/** Season overview/description */
	overview: string;
	/** Relative path to the season poster */
	poster_path?: string;
	/** Season number within the TV show */
	season_number: number;
	/** Average user rating (0–10) */
	vote_average: number;
};

/**
 * Available append-to-response options for TV season details.
 * These allow fetching additional related data in a single API request.
 */
export type TVSeasonAppendToResponseNamespace =
	| "aggregate_credits"
	| "credits"
	| "external_ids"
	| "images"
	| "translations"
	| "videos"
	| "watch_providers";

/**
 * Maps append-to-response keys to their corresponding response types.
 */
export type TVSeasonAppendableMap = {
	aggregate_credits: TVSeasonAggregateCredits;
	credits: TVSeasonCredits;
	external_ids: TVSeasonExternalIDs;
	images: TVSeasonImages;
	translations: TVSeasonTranslations;
	videos: TVSeasonVideos;
	watch_providers: MediaWatchProviders;
};

/**
 * TV season details with additional appended data based on the requested namespaces.
 * @template T - Array of append-to-response namespace keys to include
 */
export type TVSeasonDetailsWithAppends<T extends readonly TVSeasonAppendToResponseNamespace[]> = TVSeason & {
	[K in T[number]]: TVSeasonAppendableMap[K];
};

// MARK: Aggregate Credits

/** Aggregate cast and crew credits for a TV season across all its episodes. */
export type TVSeasonAggregateCredits = TVAggregateCredits;

// MARK: Changes

/** Season change history, using the same structure as other TMDB change responses. */
export type TVSeasonChanges = import("./common").Changes;

// MARK: Credits

/** Credits (cast & crew) for a TV season, mirroring the series-level credits shape. */
export type TVSeasonCredits = {
	/** TMDB unique identifier */
	id: number;
	/** Cast members */
	cast: Cast[];
	/** Crew members */
	crew: Crew[];
};

// MARK: External IDs

/** External platform identifiers for a TV season (subset of TV series external IDs). */
export type TVSeasonExternalIDs = Pick<TVExternalIDs, "id" | "freebase_mid" | "freebase_id" | "tvdb_id" | "tvrage_id" | "wikidata_id">;

// MARK: Images

/**
 * Images associated with a TV season.
 * Contains posters only.
 */
export type TVSeasonImages = ImagesResult<ImageItem, "posters">;

// MARK: Translations

/** Translation data for a TV season. */
export type TVSeasonTranslationData = {
	name?: string;
	overview?: string;
};

/** Collection of all available translations for a TV season. */
export type TVSeasonTranslations = TranslationResults<TVSeasonTranslationData>;

// MARK: Videos

/** Videos (trailers, teasers, clips) for a TV season. */
export type TVSeasonVideos = VideoResults;

// MARK: Parameters

/** Parameters for the season details endpoint. */
export type TVSeasonDetailsParams = Prettify<
	TVSeasonBaseParams & { append_to_response?: TVSeasonAppendToResponseNamespace[] } & WithParams<"language">
>;

/** Parameters for the season aggregate credits endpoint. */
export type TVSeasonAggregateCreditsParams = TVSeasonBaseParams & WithLanguage;

/** Parameters for the season credits endpoint. */
export type TVSeasonCreditsParams = TVSeasonBaseParams & WithLanguage;

/** Parameters for the season images endpoint, with optional language filtering. */
export type TVSeasonImagesParams = TVSeasonBaseParams &
	WithLanguage & {
		/** Languages to include images for. Pass an array — it will be serialized as a comma-separated list (e.g. ["en", "null"]). Use "null" to include untagged images. */
		include_image_language?: (Language | "null")[];
	};

/** Parameters for the season videos endpoint, with optional language filtering. */
export type TVSeasonVideosParams = TVSeasonBaseParams & WithLanguage & { include_video_language?: string };

/** Parameters for the season watch providers endpoint. */
export type TVSeasonWatchProvidersParams = TVSeasonBaseParams & WithLanguage;

/** Parameters for the season changes endpoint. */
export type TVSeasonChangesParams = TVSeasonId & Prettify<WithParams<"page"> & DateRange>;
