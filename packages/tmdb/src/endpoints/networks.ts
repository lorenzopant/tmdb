import { ENDPOINTS } from "../routes";
import { AlternativeNamesResult } from "../types";
import { Network, NetworkBaseParams, NetworkImages } from "../types/networks";
import { TMDBAPIBase } from "./base";

export class NetworksAPI extends TMDBAPIBase {
	private networkPath(network_id: number): string {
		return `${ENDPOINTS.NETWORKS.DETAILS}/${network_id}`;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/network/{network_id}
	 *
	 * Get the network details by ID.
	 *
	 * @param network_id Unique identifier for the network
	 * @reference https://developer.themoviedb.org/reference/network-details
	 */
	async details(params: NetworkBaseParams): Promise<Network> {
		const endpoint = this.networkPath(params.network_id);
		return this.client.request<Network>(endpoint);
	}

	/**
	 * Alternative names
	 * GET - https://api.themoviedb.org/3/network/{network_id}/alternative_names
	 *
	 * Get the list of alternative names for a network.
	 *
	 * @param network_id Unique identifier for the network
	 * @reference https://developer.themoviedb.org/reference/network-alternative-names
	 */
	async alternative_names(params: NetworkBaseParams): Promise<AlternativeNamesResult> {
		const endpoint = `${this.networkPath(params.network_id)}${ENDPOINTS.NETWORKS.ALTERNATIVE_NAMES}`;
		return this.client.request<AlternativeNamesResult>(endpoint);
	}

	/**
	 * Images
	 * GET - https://api.themoviedb.org/3/network/{network_id}/images
	 *
	 * Get the logos for a network by ID.
	 *
	 * @param network_id Unique identifier for the network
	 * @reference https://developer.themoviedb.org/reference/network-images
	 */
	async images(params: NetworkBaseParams): Promise<NetworkImages> {
		const endpoint = `${this.networkPath(params.network_id)}${ENDPOINTS.NETWORKS.IMAGES}`;
		return this.client.request<NetworkImages>(endpoint);
	}
}
