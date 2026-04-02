import { ImageCollectionKey, ImagesConfig } from "../types";
import { BackdropSize, IMAGE_BASE_URL, IMAGE_SECURE_BASE_URL, LogoSize, PosterSize, ProfileSize, StillSize } from "../types/config/images";
import { isRecord } from "../utils";

const IMAGE_PATH_BUILDERS = {
	backdrop_path: "backdrop",
	logo_path: "logo",
	poster_path: "poster",
	profile_path: "profile",
	still_path: "still",
} as const;

const IMAGE_COLLECTION_BUILDERS: Record<ImageCollectionKey, keyof typeof IMAGE_PATH_BUILDERS | "logo_path"> = {
	backdrops: "backdrop_path",
	logos: "logo_path",
	posters: "poster_path",
	profiles: "profile_path",
	stills: "still_path",
};

type ImagePathKey = keyof typeof IMAGE_PATH_BUILDERS;

export class ImageAPI {
	private options: ImagesConfig;

	constructor(options: ImagesConfig = {}) {
		this.options = { secure_images_url: true, ...options };
	}

	private buildUrl(path: string, size: string): string {
		const baseUrl = this.options.secure_images_url ? IMAGE_SECURE_BASE_URL : IMAGE_BASE_URL;
		return `${baseUrl}${size}${path}`;
	}

	public backdrop(path: string, size: BackdropSize = this.options.default_image_sizes?.backdrops || "w780"): string {
		return this.buildUrl(path, size);
	}

	public logo(path: string, size: LogoSize = this.options.default_image_sizes?.logos || "w185"): string {
		return this.buildUrl(path, size);
	}

	public poster(path: string, size: PosterSize = this.options.default_image_sizes?.posters || "w500"): string {
		return this.buildUrl(path, size);
	}

	public profile(path: string, size: ProfileSize = this.options.default_image_sizes?.profiles || "w185"): string {
		return this.buildUrl(path, size);
	}

	public still(path: string, size: StillSize = this.options.default_image_sizes?.still || "w300"): string {
		return this.buildUrl(path, size);
	}

	/**
	 * Recursively processes an object or array to autocomplete image paths by transforming string values
	 * and tracking the current image collection context.
	 *
	 * @template T - The type of the value being processed
	 * @param value - The value to process (can be an object, array, string, or primitive)
	 * @param collectionKey - Optional image collection key to maintain context during recursion
	 * @returns The processed value with autocompleted image paths, maintaining the original type
	 *
	 * @remarks
	 * - Arrays are recursively mapped over each entry
	 * - String values are transformed using {@link transformPathValue}
	 * - Object keys that match image collection keys update the collection context
	 * - Non-record, non-array values are returned unchanged
	 */
	public autocompleteImagePaths<T>(value: T, collectionKey?: ImageCollectionKey): T {
		if (Array.isArray(value)) {
			return value.map((entry) => this.autocompleteImagePaths(entry, collectionKey)) as T;
		}

		if (!isRecord(value)) {
			return value;
		}

		const transformed: Record<string, unknown> = {};
		for (const [key, entry] of Object.entries(value)) {
			if (typeof entry === "string") {
				transformed[key] = this.transformPathValue(key, entry, collectionKey);
				continue;
			}

			const nextCollectionKey = this.isImageCollectionKey(key) ? key : collectionKey;
			transformed[key] = this.autocompleteImagePaths(entry, nextCollectionKey);
		}

		return transformed as T;
	}

	// MARK: Private methods
	private isImageCollectionKey(value: string): value is ImageCollectionKey {
		return value in IMAGE_COLLECTION_BUILDERS;
	}

	private isFullUrl(path: string): boolean {
		return /^https?:\/\//.test(path);
	}

	private buildImageUrl(key: ImagePathKey, path: string): string {
		const method = IMAGE_PATH_BUILDERS[key];
		return this[method](path);
	}

	private transformPathValue(key: string, value: string, collectionKey?: ImageCollectionKey): string {
		if (!value.startsWith("/") || this.isFullUrl(value)) return value;

		if (key in IMAGE_PATH_BUILDERS) {
			return this.buildImageUrl(key as ImagePathKey, value);
		}

		if (key === "file_path" && collectionKey) {
			return this.buildImageUrl(IMAGE_COLLECTION_BUILDERS[collectionKey], value);
		}

		return value;
	}
}
