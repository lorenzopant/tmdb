import type { ImageCollectionKey } from "../common/images";

// Image base URLs
export const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/";
export const IMAGE_SECURE_BASE_URL = "https://image.tmdb.org/t/p/";

// Backdrop sizes
export const BACKDROP_SIZES = ["w300", "w780", "w1280", "original"] as const;
export type BackdropSize = (typeof BACKDROP_SIZES)[number];

// Logo sizes
export const LOGO_SIZES = ["w45", "w92", "w154", "w185", "w300", "w500", "original"] as const;
export type LogoSize = (typeof LOGO_SIZES)[number];

// Poster sizes
export const POSTER_SIZES = ["w92", "w154", "w185", "w342", "w500", "w780", "original"] as const;
export type PosterSize = (typeof POSTER_SIZES)[number];

// Profile sizes
export const PROFILE_SIZES = ["w45", "w185", "h632", "original"] as const;
export type ProfileSize = (typeof PROFILE_SIZES)[number];

// Still sizes
export const STILL_SIZES = ["w92", "w185", "w300", "original"] as const;
export type StillSize = (typeof STILL_SIZES)[number];

// Union of all known sizes (optional)
export type ImageSize = BackdropSize | LogoSize | PosterSize | ProfileSize | StillSize;

/**
 * Image size type definitions
 */
export type ImageSizeTypes = {
	/** Size options for backdrop images: "w300", "w780", "w1280", "original" */
	BackdropSize: BackdropSize;
	/** Size options for logo images: "w45", "w92", "w154", "w185", "w300", "w500", "original" */
	LogoSize: LogoSize;
	/** Size options for poster images: "w92", "w154", "w185", "w342", "w500", "w780", "original" */
	PosterSize: PosterSize;
	/** Size options for profile images: "w45", "w185", "h632", "original" */
	ProfileSize: ProfileSize;
	/** Size options for still images: "w92", "w185", "w300", "original" */
	StillSize: StillSize;
	/** Union of all available image sizes */
	ImageSize: ImageSize;
};

export type DefaultImageSizesConfig = {
	posters?: PosterSize;
	backdrops?: BackdropSize;
	logos?: LogoSize;
	profiles?: ProfileSize;
	still?: StillSize;
};

/**
 * Per-collection language priority order used by `autocomplete_paths`.
 *
 * When set, image items in the matching collection array are reordered so that
 * images whose `iso_639_1` matches earlier priority entries appear first.
 * No items are ever dropped — only their order is affected.
 *
 * Special values:
 * - `"null"` — matches untagged images (where `iso_639_1` is `null` or absent)
 * - `"*"` — catch-all: consumes all remaining items at that position
 *
 * Items not matched by any entry are appended at the end.
 *
 * @example
 * // Prefer textless posters → English → any fallback
 * { posters: ["null", "en", "*"] }
 */
export type ImageLanguagePriorityConfig = Partial<
	Record<"backdrops" | "logos" | "posters" | "profiles" | "stills", string[]>
>;

/**
 * Fallback URL(s) used when an image path field is absent (`null` / `undefined`) in a TMDB
 * API response and `autocompleteImagePaths` is applied.
 *
 * - **string** — one URL used for every image type
 * - **object** — per-type URLs; any unspecified type keeps the original `null` / `undefined`
 *
 * @example
 * // Single fallback for everything
 * fallback_url: "/placeholder.png"
 *
 * @example
 * // Different placeholders per type
 * fallback_url: {
 *   posters: "/poster-placeholder.png",
 *   backdrops: "/backdrop-placeholder.png",
 * }
 */
export type FallbackUrlConfig = string | Partial<Record<ImageCollectionKey, string>>;

export type ImagesConfig = {
	/**
	 * Whether to use the secure (HTTPS) image base URL.
	 * Defaults to true. Set to false only if working in an environment where HTTPS is not supported
	 * or where you explicitly need non-secure image URLs.
	 */
	secure_images_url?: boolean;
	/**
	 * Provide default image size configuration for each type of images.
	 */
	default_image_sizes?: Partial<DefaultImageSizesConfig>;
	/**
	 * Automatically expand TMDB image paths found in API responses into full URLs
	 * using the configured default image sizes.
	 *
	 * This is disabled by default to preserve the existing response shape semantics,
	 * where fields like `poster_path` contain the original relative TMDB path.
	 */
	autocomplete_paths?: boolean;
	/**
	 * Controls the order of image items inside collection arrays (e.g. `posters`, `backdrops`)
	 * when `autocomplete_paths` is enabled.
	 *
	 * Use `"null"` to match untagged images, ISO-639-1 codes (e.g. `"en"`) to match
	 * language-specific images, and `"*"` as a catch-all fallback.
	 *
	 * Items not matched by any entry are appended at the end. No items are dropped.
	 *
	 * @example
	 * image_language_priority: {
	 *   posters: ["null", "en", "*"],
	 * }
	 */
	image_language_priority?: ImageLanguagePriorityConfig;
	/**
	 * When `true`, automatically derives `include_image_language` from the language
	 * codes declared in `image_language_priority` and injects it into every `.images()`
	 * request — so TMDB returns the language variants that the priority config expects
	 * to sort.
	 *
	 * The injected value is the union of all language codes across all configured
	 * collections, with `"*"` excluded (it has no meaning as an HTTP parameter).
	 * An explicit `include_image_language` on the call site always takes precedence.
	 *
	 * Requires `image_language_priority` to be set; has no effect without it.
	 *
	 * @default false
	 *
	 * @example
	 * // Config: automatically fetch Italian + textless posters on every images() call
	 * images: {
	 *   autocomplete_paths: true,
	 *   image_language_priority: { posters: ["it", "null", "*"] },
	 *   auto_include_image_language: true,
	 * }
	 * // Equivalent to always passing: include_image_language: ["it", "null"]
	 */
	auto_include_image_language?: boolean;
	/**
	 * Fallback URL returned for image path fields that are absent (`null` / `undefined`) in the
	 * API response.
	 *
	 * Works independently of `autocomplete_paths`. When set, the response traversal is activated
	 * even if `autocomplete_paths` is `false`, but only null/undefined image paths are replaced —
	 * existing relative paths are left as-is unless `autocomplete_paths` is also `true`.
	 *
	 * @example
	 * fallback_url: "/placeholder.png"
	 *
	 * @example
	 * fallback_url: { posters: "/poster-ph.png", backdrops: "/backdrop-ph.png" }
	 */
	fallback_url?: FallbackUrlConfig;
};
