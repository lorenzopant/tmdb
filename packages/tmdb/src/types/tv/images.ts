import { ImageItem, ImagesResult } from "../common/images";

/**
 * Images related to a TV show.
 * Contains backdrops, logos, posters and stills.
 */
export type TVImages = ImagesResult<TVImageItem, "backdrops" | "logos" | "posters">;

/**
 * Image items for TVShows have an undocumented "iso_3166_1" property
 * I decided to put it anyway as an optional property,
 * but only for tv shows images.
 */
export type TVImageItem = ImageItem & { iso_3166_1?: string };
