import { Cast, Crew } from "../common";
import { TVEpisodeCredits } from "./credits";
import { TVEpisodeExternalIDs } from "./external_ids";
import { TVEpisodeImages } from "./images";
import { TVEpisodeTranslations } from "./translations";
import { TVEpisodeVideos } from "./videos";

/**
 * Represents a single episode of a TV series from the TMDB API.
 * Contains detailed metadata including crew, guest stars, and voting stats.
 */
export type TVEpisode = {
	/** ISO 8601 formatted date when the episode first aired (e.g. `"2023-05-15"`) */
	air_date: string;
	/** Array of crew members who worked on this specific episode */
	crew: Crew[];
	/** Sequential number of this episode within its season (1-based) */
	episode_number: number;
	/** Array of guest stars appearing in this episode (subset of cast without `cast_id`) */
	guest_stars: Omit<Cast, "cast_id">[];
	/** Episode title or name */
	name: string;
	/** Episode synopsis or description */
	overview: string;
	/** Unique TMDB identifier for this episode */
	id: number;
	/** Production code assigned by the production company, if available */
	production_code?: string | null;
	/** Runtime of the episode in minutes */
	runtime: number;
	/** Season number this episode belongs to (1-based) */
	season_number: number;
	/** Relative path to the episode still/image (e.g. `"/abc123.jpg"`), or null if none */
	still_path?: string | null;
	/** Average user rating of the episode (0-10 scale) */
	vote_average: number;
	/** Total number of user votes for the episode */
	vote_count: number;
};

/**
 * Available append-to-response options for TV episode details.
 * These allow fetching additional related data in a single API request.
 */
export type TVEpisodeAppendToResponseNamespace = "credits" | "external_ids" | "images" | "translations" | "videos";

/**
 * Maps append-to-response keys to their corresponding response types.
 */
export type TVEpisodeAppendableMap = {
	credits: TVEpisodeCredits;
	external_ids: TVEpisodeExternalIDs;
	images: TVEpisodeImages;
	translations: TVEpisodeTranslations;
	videos: TVEpisodeVideos;
};

/**
 * TV show details with additional appended data based on the requested namespaces.
 * @template T - Array of append-to-response namespace keys to include
 */
export type TVEpisodeDetailsWithAppends<T extends readonly TVEpisodeAppendToResponseNamespace[]> = TVEpisode & {
	[K in T[number]]: TVEpisodeAppendableMap[K];
};
