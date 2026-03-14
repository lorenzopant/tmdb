import { NetworkItem } from "./networks";
import { TVEpisode } from "./tv-episodes";

/**
 * Full details for a TV episode group, including grouped episode lists.
 */
export type TVEpisodeGroupDetails = {
	/** Description of the episode group */
	description: string;
	/** Total number of episodes across all groups */
	episode_count: number;
	/** Number of group entries in this episode group */
	group_count: number;
	/** Unique episode group identifier */
	id: string;
	/** Name of the episode group */
	name: string;
	/** Network associated with the episode group, if available */
	network: NetworkItem | null;
	/** Grouping strategy type (e.g., numbered by season, collections, etc.) */
	type: TVEpisodeGroupType;
	/** Grouped episode entries */
	groups: TVEpisodeGroupDetailsItem[];
};

/**
 * A group within an episode group (e.g., a season-like grouping).
 */
export type TVEpisodeGroupDetailsItem = {
	/** Unique group identifier */
	id: string;
	/** Group name */
	name: string;
	/** Display order */
	order: number;
	/** Whether the group is locked on TMDB */
	locked: boolean;
	/** Episodes included in this group */
	episodes: TVEpisodeGroupEpisode[];
};

/**
 * A simplified TV episode item returned in episode group details.
 */
export type TVEpisodeGroupEpisode = Omit<TVEpisode, "guest_stars" | "runtime"> & {
	/** Production code for the episode, if available */
	production_code?: string | null;
	/** Path to the episode still image, if available */
	still_path?: string | null;
};

/**
 * Supported episode group type identifiers.
 */
export enum TVEpisodeGroupType {
	OriginalAirDate = 1,
	Absolute = 2,
	Dvd = 3,
	Digital = 4,
	StoryArc = 5,
	Production = 6,
	TV = 7,
}

export type TVEpisodeGroupParams = {
	/** Episode group identifier */
	episode_group_id: string;
};
