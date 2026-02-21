import { ImageItem } from "../common";

/**
 * Images related to a TV show.
 * Contains backdrops, logos, posters and stills.
 */
export type TVImages = {
	/** TMDB unique identifier for the TV show. */
	id: number;
	/** List of backdrop images for the TV show. */
	backdrops: ImageItem[];
	/** List of logo images for the TV show. */
	logos: ImageItem[];
	/** List of poster images for the TV show. */
	posters: ImageItem[];
	/** List of still images for the TV show. */
	stills?: ImageItem[];
};
