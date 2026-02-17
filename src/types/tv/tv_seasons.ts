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
