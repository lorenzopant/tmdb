/**
 * External platform identifiers for a TV series
 */
export type TVExternalIDs = {
	/** TV series identifier in TMDB */
	id: number;
	/** IMDb identifier (e.g., "tt0944947"), null if not available */
	imdb_id?: string;
	/** Freebase MID identifier (deprecated), null if not available */
	freebase_mid?: string;
	/** Freebase ID (deprecated), null if not available */
	freebase_id?: string;
	/** TheTVDB identifier, null if not available */
	tvdb_id?: number;
	/** TVRage identifier (service discontinued), null if not available */
	tvrage_id?: number;
	/** Wikidata identifier (e.g., "Q23572"), null if not available */
	wikidata_id?: string;
	/** Facebook page identifier, null if not available */
	facebook_id?: string;
	/** Instagram handle, null if not available */
	instagram_id?: string;
	/** Twitter/X handle, null if not available */
	twitter_id?: string;
};
