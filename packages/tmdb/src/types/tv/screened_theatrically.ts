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
