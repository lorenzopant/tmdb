import { ENDPOINTS } from "../routes";
import { TMDBConfigurationResponse } from "../types/configuration";
import { TMDBAPIBase } from "./base";

export class ConfigurationAPI extends TMDBAPIBase {
	/**
	 * Fetch the configuration details (images base URLs + size lists, change keys).
	 * @returns {Promise<TMDBConfigurationResponse>}
	 */
	async get(): Promise<TMDBConfigurationResponse> {
		return this.client.request<TMDBConfigurationResponse>(ENDPOINTS.CONFIGURATION.DETAILS);
	}
}
