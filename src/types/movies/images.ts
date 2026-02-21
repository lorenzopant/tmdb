import { ImageItem } from "../common";

/**
 * Collection of movie images (backdrops, logos, posters)
 */
export type MovieImages = {
	/** Movie identifier */
	id: number;
	/** Array of backdrop images */
	backdrops: ImageItem[];
	/** Array of logo images */
	logos: ImageItem[];
	/** Array of poster images */
	posters: ImageItem[];
};
