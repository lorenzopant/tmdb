import { LiteralUnion } from "../utility";

/**
 * Defines the possible image collection keys returned by TMDB image endpoints.
 */
export type ImageCollectionKey = "backdrops" | "logos" | "posters" | "profiles" | "stills";

/**
 * Image metadata and details
 */
export type ImageItem = {
	/** Aspect ratio of the image (width/height) */
	aspect_ratio: number;
	/** Image height in pixels */
	height: number;
	/** ISO 639-1 language code if image contains text, null otherwise */
	iso_639_1?: string | null;
	/** Relative path to the image file (append to base URL) */
	file_path: string;
	/** Average user rating for this image */
	vote_average: number;
	/** Total number of votes for this image */
	vote_count: number;
	/** Image width in pixels */
	width: number;
};

/**
 * Represents a single company or network logo (slightly different from ImageItem)
 *
 * Note on FileType from TMDB:
 * There are two image formats that are supported for companies, PNG's and SVG's.
 * You can see which type the original file is by looking at the file_type field.
 * We prefer SVG's as they are resolution independent and as such, the width and height are only
 * there to reflect the original asset that was uploaded.
 * An SVG can be scaled properly beyond those dimensions if you call them as a PNG.
 */
export type OrganizationImage = Omit<ImageItem, "iso_639_1"> & {
	id: string;
	file_type: FileType;
};

/**
 * Represents the response from a TMDB image endpoint.
 * Use the generic parameter to specify which image collections are present.
 *
 * @template K - The image collection keys available for the given entity type.
 *
 * @example
 * // Company or Network (logos only)
 * type OrganizationImagesResult = ImagesResult<"logos">;
 *
 * @example
 * // Movie or TV Show (backdrops, logos and posters)
 * type MovieImagesResult = ImagesResult<"backdrops" | "logos" | "posters">;
 *
 * @example
 * // Person (profiles only)
 * type PersonImagesResult = ImagesResult<"profiles">;
 */
export type ImagesResult<T, K extends ImageCollectionKey> = {
	/** The unique TMDB identifier of the entity. */
	id: number;
} & {
	[P in K]: T[];
};

/** Available file type on svg (for images) */
export type FileType = LiteralUnion<".png" | ".svg">;
