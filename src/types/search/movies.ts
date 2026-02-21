/**
 * Simplified movie information used in lists and search results
 */
export type MovieResultItem = {
	/** Path to backdrop image */
	backdrop_path: string;
	/** Unique movie identifier */
	id: number;
	/** Movie title (localized) */
	title: string;
	/** Original title in the original language */
	original_title: string;
	/** Plot synopsis/overview */
	overview: string;
	/** Path to poster image */
	poster_path: string;
	/** Whether the movie is marked as adult content */
	adult: boolean;
	/** Original language of the movie (ISO 639-1 code) */
	original_language: string;
	/** Array of genre IDs (use /genre/movie/list to map to names) */
	genre_ids: number[];
	/** Popularity score calculated by TMDB */
	popularity: number;
	/** Release date in ISO 8601 format (YYYY-MM-DD) */
	release_date: string;
	/** Whether a video is available on TMDB */
	video: boolean;
	/** Average user rating (0-10 scale) */
	vote_average: number;
	/** Total number of votes received */
	vote_count: number;
};
