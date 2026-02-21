import { CountryISO3166_1 } from "./config/countries";
import { BackdropSize, LogoSize, PosterSize, ProfileSize, StillSize } from "./config/images";
import { Language } from "./config/languages";
import { Timezone } from "./config/timezones";

export type TMDBOptions = {
	/**
	 * The language to use for requests (ISO 639-1 code)
	 * This provides localization and translated data.
	 */
	language?: Language;
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
	/**
	 * Provide a timezone default for all the TV Series related queries
	 * which support the timezone param.
	 * The timezone is used to calculate the “today” for airing TV shows.
	 * Read more: https://www.themoviedb.org/talk/54c554679251416eae010d6d
	 */
	timezone?: Timezone;
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

export type MediaType = "movie" | "tv";

/**
 * Forces TypeScript to resolve and display the final shape of a type.
 * Useful for seeing the actual properties when hovering in the IDE.
 */
export type Prettify<T> = T extends object ? (T extends infer O ? { [K in keyof O]: Prettify<O[K]> } : never) : T;
