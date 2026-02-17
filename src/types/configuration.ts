import { Language } from "./lang";

export type ImageConfiguration = {
	base_url: string;
	secure_base_url: string;
	backdrop_sizes: string[];
	logo_sizes: string[];
	poster_sizes: string[];
	profile_sizes: string[];
	still_sizes: string[];
};

export type ConfigurationResponse = {
	images: ImageConfiguration;
	change_keys: string[];
};

export type ConfigurationCountriesParams = {
	language?: Language;
};

export type ConfigurationJob = {
	department: string;
	jobs: string[];
};

export type ConfigurationLanguage = {
	iso_639_1: string;
	english_name: string;
	name: string;
};

export type ConfigurationTimezone = {
	iso_3166_1: string;
	zones: string[];
};
