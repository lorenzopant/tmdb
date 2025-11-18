import { ENDPOINTS } from "../routes";
import { Country } from "../types";
import { ConfigurationCountriesParams, ConfigurationResponse } from "../types/configuration";
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
}
