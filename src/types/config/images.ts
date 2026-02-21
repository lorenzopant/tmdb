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
