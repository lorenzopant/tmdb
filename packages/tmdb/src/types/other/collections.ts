import { MediaType } from "../common";
import { MovieResultItem } from "../search";

/**
 * Represents a TMDB collection (e.g. a movie franchise or saga),
 * including metadata and the list of media items that belong to it.
 */
export type Collection = {
	/** Unique TMDB identifier for the collection */
	id: number;
	/** Display name of the collection */
	name: string;
	/** Original language code of the collection (e.g. `"en"`, `"it"`) */
	original_language: string;
	/** Name of the collection in its original language */
	original_name: string;
	/** Short description or synopsis of the collection */
	overview: string;
	/** Relative path to the collection's poster image on TMDB (e.g. `"/abc123.jpg"`) */
	poster_path: string;
	/** Relative path to the collection's backdrop image on TMDB (e.g. `"/xyz789.jpg"`) */
	backdrop_path: string;
	/** Ordered list of media items that make up the collection */
	parts: CollectionItem[];
};

/**
 * Represents a single media item within a collection.
 * Extends {@link MovieResultItem} by replacing `title` and `original_title`
 * with their localization-agnostic equivalents, and adding a `media_type` discriminator.
 * Hopefully both tv and movies use name and original name instead of title.
 */
export type CollectionItem = Omit<MovieResultItem, "title" | "original_title"> & {
	/** The type of media (e.g. `"movie"` or `"tv"`), used as a discriminator */
	media_type: MediaType;
	/** Display name of the media item */
	name: string;
	/** Name of the media item in its original language */
	original_name: string;
};
