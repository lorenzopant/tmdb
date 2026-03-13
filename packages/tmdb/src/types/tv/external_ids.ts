/**
 * External platform identifiers for a TV series
 */
export type TVExternalIDs = {
	/** TV series identifier in TMDB */
	id: number;
	/** IMDb identifier (e.g., "tt0944947"), null if not available */
	imdb_id?: string | null;
	/** Freebase MID identifier (deprecated), null if not available */
	freebase_mid?: string | null;
	/** Freebase ID (deprecated), null if not available */
	freebase_id?: string | null;
	/** TheTVDB identifier, null if not available */
	tvdb_id?: number | null;
	/** TVRage identifier (service discontinued), null if not available */
	tvrage_id?: number | null;
	/** Wikidata identifier (e.g., "Q23572"), null if not available */
	wikidata_id?: string | null;
	/** Facebook page identifier, null if not available */
	facebook_id?: string | null;
	/** Instagram handle, null if not available */
	instagram_id?: string | null;
	/** Twitter/X handle, null if not available */
	twitter_id?: string | null;
};
