import { ENDPOINTS } from "../routes";
import { Country } from "../types";
import {
	ConfigurationCountriesParams,
	ConfigurationJob,
	ConfigurationLanguage,
	ConfigurationResponse,
	ConfigurationTimezone,
} from "../types/configuration";
import { TMDBAPIBase } from "./base";

export class ConfigurationAPI extends TMDBAPIBase {
	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/configuration
	 *
	 * Query the API configuration details.
	 * The data returned here in the configuration endpoint is designed to provide some of
	 * the required information you'll need as you integrate our API.
	 * For example, you can get a list of valid image sizes and the valid image address.
	 * @reference https://developer.themoviedb.org/reference/configuration-details
	 */
	async get(): Promise<ConfigurationResponse> {
		return this.client.request<ConfigurationResponse>(ENDPOINTS.CONFIGURATION.DETAILS);
	}

	/**
	 * Countries
	 * GET -  https://api.themoviedb.org/3/configuration/countries
	 *
	 * Get the list of countries (ISO 3166-1 tags) used throughout TMDB.
	 * @param language Language (Defaults to en-US)
	 * @reference https://developer.themoviedb.org/reference/configuration-countries
	 */
	async countries(params?: ConfigurationCountriesParams): Promise<Country[]> {
		return this.client.request<Country[]>(ENDPOINTS.CONFIGURATION.COUNTRIES, this.withLanguage(params));
	}

	/**
	 * Jobs
	 * GET -  https://api.themoviedb.org/3/configuration/jobs
	 *
	 * Get the list of the jobs and departments used throughout TMDB.
	 * @reference https://developer.themoviedb.org/reference/configuration-jobs
	 */
	async jobs(): Promise<ConfigurationJob[]> {
		return this.client.request<ConfigurationJob[]>(ENDPOINTS.CONFIGURATION.JOBS);
	}

	/**
	 * Languages
	 * GET -  https://api.themoviedb.org/3/configuration/languages
	 *
	 * Get the list of the languages (ISO 639-1 tags) used throughout TMDB.
	 * @reference https://developer.themoviedb.org/reference/configuration-languages
	 */
	async languages(): Promise<ConfigurationLanguage[]> {
		return this.client.request<ConfigurationLanguage[]>(ENDPOINTS.CONFIGURATION.LANGUAGES);
	}

	/**
	 * Timezones
	 * GET -  https://api.themoviedb.org/3/configuration/timezones
	 *
	 * Get the list of timezones used throughout TMDB.
	 * @reference https://developer.themoviedb.org/reference/configuration-timezones
	 */
	async timezones(): Promise<ConfigurationTimezone[]> {
		return this.client.request<ConfigurationTimezone[]>(ENDPOINTS.CONFIGURATION.TIMEZONES);
	}
}
