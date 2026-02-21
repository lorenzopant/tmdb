import { NetworkItem } from "../networks";

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
