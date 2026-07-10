import { TVEpisodeGroupType } from "./enums";
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
 * Unlike a standalone episode, grouped episodes have no `crew`, but do carry
 * their `order` within the group and the parent show's `show_id`.
 */
export type TVEpisodeGroupEpisode = Omit<TVEpisode, "guest_stars" | "crew"> & {
	/** Display order of the episode within the group */
	order: number;
	/** Unique identifier of the parent TV show */
	show_id: number;
};

export type TVEpisodeGroupParams = {
	/** Episode group identifier */
	episode_group_id: string;
};
