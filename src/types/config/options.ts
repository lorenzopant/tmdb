import { CountryISO3166_1 } from "./countries";
import { ImagesConfig } from "./images";
import { Language } from "./languages";
import { Timezone } from "./timezones";

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
