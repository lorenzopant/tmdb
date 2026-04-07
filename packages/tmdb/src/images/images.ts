import { ImageCollectionKey, ImagesConfig } from "../types";
import { BackdropSize, IMAGE_BASE_URL, IMAGE_SECURE_BASE_URL, LogoSize, PosterSize, ProfileSize, StillSize } from "../types/config/images";
import { isPlainObject } from "../utils";

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
	 * - Non-plain objects (e.g. Date/class instances) are returned unchanged
	 */
	public autocompleteImagePaths<T>(value: T, collectionKey?: ImageCollectionKey): T {
		if (Array.isArray(value)) {
			const priorities = collectionKey && this.options.image_language_priority?.[collectionKey];
			const items = priorities ? this.sortByLanguagePriority(value, priorities) : value;
			return items.map((entry) => this.autocompleteImagePaths(entry, collectionKey)) as T;
		}

		if (!isPlainObject(value)) {
			return value;
		}

		const transformed: Record<string, unknown> = Object.create(null);
		for (const [key, entry] of Object.entries(value)) {
			// Guard against prototype pollution vectors in untrusted response data
			if (key === "__proto__" || key === "constructor" || key === "prototype") {
				transformed[key] = entry;
				continue;
			}

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

	/**
	 * Reorders an image-item array according to a language priority list.
	 *
	 * Iterates through each priority entry in order:
	 * - `"null"` matches items where `iso_639_1` is `null` or `undefined` (untagged)
	 * - `"*"` consumes all remaining items as a catch-all and stops processing
	 * - Any other string is matched against `iso_639_1` directly
	 *
	 * Items not matched by any entry are appended at the end.
	 * No items are dropped — only their order changes.
	 */
	private sortByLanguagePriority(items: unknown[], priorities: string[]): unknown[] {
		const result: unknown[] = [];
		const remaining = [...items];

		for (const priority of priorities) {
			if (priority === "*") {
				result.push(...remaining.splice(0, remaining.length));
				break;
			}

			const next: unknown[] = [];
			for (const item of remaining) {
				const lang = (item as Record<string, unknown>)?.iso_639_1;
				const isMatch = priority === "null" ? lang == null : lang === priority;
				if (isMatch) {
					result.push(item);
				} else {
					next.push(item);
				}
			}

			remaining.length = 0;
			remaining.push(...next);
		}

		// Append items not matched by any priority entry
		result.push(...remaining);
		return result;
	}

	private isImageCollectionKey(value: string): value is ImageCollectionKey {
		return Object.hasOwn(IMAGE_COLLECTION_BUILDERS, value);
	}

	private isFullUrl(path: string): boolean {
		return /^https?:\/\//.test(path);
	}

	private buildImageUrl(key: ImagePathKey, path: string): string {
		const method = IMAGE_PATH_BUILDERS[key];
		// Ensure method is a valid own property before dynamic dispatch
		if (Object.hasOwn(this, method) || typeof (this as Record<string, unknown>)[method] !== "function") {
			// Fallback to the method lookup on the prototype (which is safe for hardcoded ImagePathKey values)
		}
		return (this[method] as (path: string) => string)(path);
	}

	private transformPathValue(key: string, value: string, collectionKey?: ImageCollectionKey): string {
		if (!value.startsWith("/") || this.isFullUrl(value)) return value;

		if (Object.hasOwn(IMAGE_PATH_BUILDERS, key)) {
			return this.buildImageUrl(key as ImagePathKey, value);
		}

		if (key === "file_path" && collectionKey) {
			return this.buildImageUrl(IMAGE_COLLECTION_BUILDERS[collectionKey], value);
		}

		return value;
	}
}
