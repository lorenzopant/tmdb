/**
 * External identifiers for a TV show.
 */
export type TVExternalIDs = {
	/** TMDB unique identifier for the TV show. */
	id: number;
	/** IMDb identifier string, or undefined if unavailable. */
	imdb_id?: string;
	/** Facebook identifier string, or undefined if unavailable. */
	facebook_id?: string;
	/** Twitter identifier string, or undefined if unavailable. */
	twitter_id?: string;
	/** Instagram identifier string, or undefined if unavailable. */
	instagram_id?: string;
};
