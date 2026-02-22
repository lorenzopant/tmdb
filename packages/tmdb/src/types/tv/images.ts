import { ImageItem } from "../common";

/**
 * Images related to a TV show.
 * Contains backdrops, logos, posters and stills.
 */
export type TVImages = {
	/** TMDB unique identifier for the TV show. */
	id: number;
	/** List of backdrop images for the TV show. */
	backdrops: TVImageItem[];
	/** List of logo images for the TV show. */
	logos: TVImageItem[];
	/** List of poster images for the TV show. */
	posters: TVImageItem[];
};

/**
 * Image items for TVShows have an undocumented "iso_3166_1" property
 * I decided to put it anyway as an optional property,
 * but only for tv shows images.
 */
export type TVImageItem = ImageItem & { iso_3166_1?: string };
