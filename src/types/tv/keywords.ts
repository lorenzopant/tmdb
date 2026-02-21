import { Keyword } from "../common";

/**
 * List of keywords related to the TV show.
 */
export type TVKeywords = {
	/** TMDB unique identifier for the TV show. */
	id: number;
	/** List of keywords related to the TV show. */
	results: Keyword[];
};
