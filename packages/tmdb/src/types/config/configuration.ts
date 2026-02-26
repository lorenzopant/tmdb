import { CountryISO3166_1 } from "./countries";
import { Language } from "./languages";

export type ImageConfiguration = {
	/** Base URL for constructing image URLs (HTTP) */
	base_url: string;
	/** Secure base URL for constructing image URLs (HTTPS) */
	secure_base_url: string;
	/** Available size options for backdrop images */
	backdrop_sizes: string[];
	/** Available size options for logo images */
	logo_sizes: string[];
	/** Available size options for poster images */
	poster_sizes: string[];
	/** Available size options for profile images */
	profile_sizes: string[];
	/** Available size options for still images (from TV shows/episodes) */
	still_sizes: string[];
};

export type ConfigurationResponse = {
	/** Image configuration settings including base URLs and available sizes */
	images: ImageConfiguration;
	/** List of keys that can be used to track configuration changes */
	change_keys: string[];
};

export type ConfigurationCountry = {
	/** ISO 3166-1 alpha-2 country code */
	iso_3166_1: CountryISO3166_1;
	/** English name of the country */
	english_name: string;
	/** Native name of the country in its local language */
	native_name: string;
};

export type ConfigurationCountriesParams = {
	/** ISO 639-1 language code for localized country names */
	language?: Language;
};

export type ConfigurationJob = {
	/** Name of the department (e.g., "Production", "Sound", "Camera") */
	department: string;
	/** List of job titles within this department */
	jobs: string[];
};

export type ConfigurationLanguage = {
	/** ISO 639-1 two-letter language code */
	iso_639_1: string;
	/** English name of the language */
	english_name: string;
	/** Native name of the language */
	name: string;
};

export type ConfigurationTimezone = {
	/** ISO 3166-1 two-letter country code */
	iso_3166_1: string;
	/** List of timezone identifiers for this country (e.g., "America/New_York") */
	zones: string[];
};
