import { CountryISO3166_1 } from "./countries";
import { BackdropSize, LogoSize, PosterSize, ProfileSize, StillSize } from "./images";
import { LanguageISO6391 } from "./lang";

export type TMDBOptions = {
	/**
	 * The language to use for requests (ISO 639-1 code)
	 * This provides localization and translated data.
	 */
	language?: LanguageISO6391;
	/**
	 * Region codes follow ISO 3166-1 (e.g. 'US', 'IT', 'JP') and are used to localize results.
	 * They affect release dates, age certifications, watch providers, and filtered movie lists.
	 * Example: 'region=IT' returns Italian-specific results for now playing, watch providers, etc.
	 * If not set, TMDB may fall back to a default or global data.
	 */
	region?: CountryISO3166_1;
	/**
	 * Provide images default configuration
	 */
	images?: ImagesConfig;
};

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
};

export type DefaultImageSizesConfig = {
	posters?: PosterSize;
	backdrops?: BackdropSize;
	logos?: LogoSize;
	profiles?: ProfileSize;
	still?: StillSize;
};
