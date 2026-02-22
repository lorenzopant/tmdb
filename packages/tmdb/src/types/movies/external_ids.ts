/**
 * External platform identifiers for a movie
 */
export type MovieExternalIDs = {
	/** Movie identifier in TMDB */
	id: number;
	/** IMDb identifier (e.g., "tt0133093"), null if not available */
	imdb_id?: string | null;
	/** Facebook page identifier, null if not available */
	facebook_id?: string | null;
	/** Twitter/X handle, null if not available */
	twitter_id?: string | null;
	/** Instagram handle, null if not available */
	instagram_id?: string | null;
};
