import { ImageItem, ImagesResult } from "../common/images";

/**
 * Collection of movie images (backdrops, logos, posters)
 */
export type MovieImages = ImagesResult<ImageItem, "backdrops" | "logos" | "posters">;
