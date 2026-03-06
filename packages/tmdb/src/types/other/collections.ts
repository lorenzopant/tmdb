import { ImageItem, MediaType, Translation, WithLanguage } from "../common";
import { Language, LanguageISO6391 } from "../config";
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

/**
 * Represents the images associated with a TMDB collection,
 * including backdrops and posters.
 */
export type CollectionImages = {
	/** Unique TMDB identifier for the collection */
	id: number;
	/** List of backdrop images available for the collection */
	backdrops: ImageItem[];
	/** List of poster images available for the collection */
	posters: ImageItem[];
};

/**
 * Represents the available translations for a TMDB collection.
 */
export type CollectionTranslations = {
	/** Unique TMDB identifier for the collection */
	id: number;
	/** List of translations available for the collection */
	translations: CollectionTranslationItem[];
};

/**
 * Represents a single translation entry for a collection,
 * containing the localized data payload.
 */
export type CollectionTranslationItem = Translation & {
	/** Localized data for this translation */
	data: CollectionTranslationData;
};

/**
 * Contains the localized fields provided by a collection translation.
 * All fields are optional as not every translation may supply all values.
 */
export type CollectionTranslationData = {
	/** Localized title of the collection */
	title?: string;
	/** Localized overview or synopsis of the collection */
	overview?: string;
	/** Localized homepage URL for the collection */
	homepage?: string;
};

/** Base param used by all collection queries */
export type BaseCollectionParam = {
	/** Uniquely identifies a collection in TMDB. */
	collection_id: number;
};

export type CollectionDetailsParams = BaseCollectionParam & WithLanguage;
export type CollectionImagesParams = BaseCollectionParam & {
	language?: Language | LanguageISO6391;
	include_image_language?: Language | LanguageISO6391;
};
