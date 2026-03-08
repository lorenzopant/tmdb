import { WithLanguage } from "../common";
import { WatchProviderItem } from "../common/media";
import { CountryISO3166_1 } from "../config";
import { ConfigurationCountry } from "../config/configuration";

/**
 * Parameters supported by watch provider namespace endpoints.
 */
export type WatchProviderListParams = WithLanguage;

/**
 * Parameters for listing the available watch provider regions.
 */
export type WatchProviderRegionsParams = WithLanguage;

/**
 * Country-specific display priorities returned by top-level watch provider list endpoints.
 */
export type WatchProviderDisplayPriorities = Partial<Record<CountryISO3166_1, number>>;

/**
 * A watch provider returned by top-level movie and TV provider list endpoints.
 */
export type WatchProviderListItem = WatchProviderItem & {
	display_priorities: WatchProviderDisplayPriorities;
};

/**
 * Response returned by movie and TV watch provider list endpoints.
 */
export type WatchProviderListResponse = {
	results: WatchProviderListItem[];
};

/**
 * Response returned by the available regions endpoint.
 */
export type WatchProviderRegionsResponse = {
	results: ConfigurationCountry[];
};
