/**
 * Collection information in search results
 */
export type CollectionResultItem = {
	/** Whether the collection contains adult content */
	adult: boolean;
	/** Path to backdrop image */
	backdrop_path: string;
	/** Unique collection identifier */
	id: number;
	/** Collection name (localized) */
	name: string;
	/** Original collection name in the original language */
	original_name: string;
	/** Original language of the collection (ISO 639-1 code) */
	original_language: string;
	/** Collection overview/description */
	overview: string;
	/** Path to poster image */
	poster_path: string;
};
