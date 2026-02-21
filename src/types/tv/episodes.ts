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
	air_date: Date;
	/** The episode number within its season */
	episode_number: number;
	/** The production code used internally during filming */
	production_code: string;
	/** The runtime of the episode in minutes */
	runtime: number;
	/** The season number this episode belongs to */
	season_number: number;
	/** The unique identifier of the TV show this episode belongs to */
	show_id: number;
	/** The path to the episode's still image (screenshot) */
	still_path: string;
};
