import { KnownForItem, KnownForMovie, KnownForTV } from "./common";

/**
 * Forces TypeScript to resolve and display the final shape of a type.
 * Useful for seeing the actual properties when hovering in the IDE.
 */
export type Prettify<T> = T extends object ? (T extends infer O ? { [K in keyof O]: Prettify<O[K]> } : never) : T;

/**
 * Type guard checks for KnowForItems (tv or movie)
 * @returns
 */
export function isKnownForMovie(item: KnownForItem): item is KnownForMovie {
	return item.media_type === "movie";
}

export function isKnownForTV(item: KnownForItem): item is KnownForTV {
	return item.media_type === "tv";
}
