import { ImagesResult, OrganizationImage } from "../common/images";
import { CountryISO3166_1 } from "../config/countries";

/**
 * Represents a network entry as returned in search results or list responses.
 *
 * @see https://developer.themoviedb.org/reference/network-details
 */
export type NetworkItem = {
	/** The unique TMDB identifier of the network. */
	id: number;
	/** Path to the network's logo, to be appended to the TMDB base image URL. */
	logo_path: string;
	/** The name of the network. */
	name: string;
	/** The ISO 3166-1 country code of the network's country of origin. */
	origin_country: CountryISO3166_1;
};

/**
 * Represents the images response for a network.
 * Networks only expose logo images.
 *
 * @see https://developer.themoviedb.org/reference/network-images
 */
export type NetworkImages = ImagesResult<OrganizationImage, "logos">;

/**
 * Represents the full details of a network, as returned by the network details endpoint.
 * Extends {@link NetworkItem} with additional metadata.
 *
 * @see https://developer.themoviedb.org/reference/network-details
 */
export type Network = NetworkItem & {
	/** The city or location of the network's headquarters, if available. */
	headquarters?: string | null;
	/** The URL of the network's official homepage, if available. */
	homepage?: string | null;
};

/**
 * Base parameters required by all network endpoints.
 *
 * @see https://developer.themoviedb.org/reference/network-details
 */
export type NetworkBaseParams = {
	/** The unique TMDB identifier of the network. */
	network_id: number;
};
