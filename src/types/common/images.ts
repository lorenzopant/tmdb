/**
 * Image metadata and details
 */
export type ImageItem = {
	/** Aspect ratio of the image (width/height) */
	aspect_ratio: number;
	/** Image height in pixels */
	height: number;
	/** ISO 639-1 language code if image contains text, null otherwise */
	iso_639_1: string | null;
	/** Relative path to the image file (append to base URL) */
	file_path: string;
	/** Average user rating for this image */
	vote_average: number;
	/** Total number of votes for this image */
	vote_count: number;
	/** Image width in pixels */
	width: number;
};
