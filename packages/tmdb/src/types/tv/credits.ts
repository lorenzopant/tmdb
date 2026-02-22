import { Cast, Crew } from "../common";

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
