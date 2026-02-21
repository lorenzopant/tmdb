import { Credit, Genre, ProductionCompany, ProductionCountry, SpokenLanguage } from "../common";
import { CountryISO3166_1 } from "../config/countries";
import { NetworkItem } from "../networks";
import { TVEpisodeItem } from "./tv_episodes";
import { TVCredits, TVExternalIDs, TVImages, TVKeywords, TVRecommendations, TVSimilar, TVVideos } from "./tv_others";
import { TVSeasonItem } from "./tv_seasons";

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

/**
 * Represent the detailed information about a TV show.
 */
export type TVDetails = {
	/** The path to the backdrop image, or null if not available */
	backdrop_path: string | null;

	/** Array of creators who developed the TV show */
	created_by: Pick<Credit, "id" | "credit_id" | "gender" | "name" | "profile_path">[];

	/** Array of typical episode runtimes in minutes */
	episode_run_time: number[];

	/** The date the first episode aired */
	first_air_date: string;

	/** Array of genres associated with the TV show */
	genres: Genre[];

	/** The official homepage URL for the TV show, or null if not available */
	homepage: string | null;

	/** The unique identifier for the TV show */
	id: number;

	/** Indicates whether the TV show is currently in production */
	in_production: boolean;

	/** Array of language codes used in the TV show */
	languages: string[];

	/** The date the most recent episode aired */
	last_air_date: string;

	/** Details of the last episode that aired, if available */
	last_episode_to_air?: TVEpisodeItem | null;

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
	overview: string | null;

	/** The popularity score of the TV show */
	popularity: number;

	/** The path to the poster image, or null if not available */
	poster_path: string | null;

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
	translations: unknown; // TODO: translations structure is variable
	videos: TVVideos;
};

/**
 * TV show details with additional appended data based on the requested namespaces.
 * @template T - Array of append-to-response namespace keys to include
 */
export type TVDetailsWithAppends<T extends readonly TVAppendToResponseNamespace[]> = TVDetails & {
	[K in T[number]]: TVAppendableMap[K];
};
