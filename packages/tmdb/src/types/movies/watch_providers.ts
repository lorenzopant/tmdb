import { CountryISO3166_1 } from "../config/countries";

/**
 * Watch provider availability by country
 */
export type MovieWatchProvider = {
	/** Movie identifier */
	id: number;
	/** Watch providers grouped by country code */
	results: Record<CountryISO3166_1, WatchProvider[]>;
};

/**
 * Watch provider options for a specific country
 */
export type WatchProvider = {
	/** URL to watch/purchase the movie */
	link: string;
	/** Streaming providers (subscription required) */
	flatrate?: WatchProviderItem[];
	/** Rental providers */
	rent?: WatchProviderItem[];
	/** Purchase providers */
	buy?: WatchProviderItem[];
};

/**
 * Individual watch provider details
 */
export type WatchProviderItem = {
	/** Path to provider logo image */
	logo_path: string;
	/** Unique provider identifier */
	provider_id: number;
	/** Provider name (e.g., "Netflix", "Amazon Prime Video") */
	provider_name: string;
	/** Display priority order (lower numbers = higher priority) */
	display_priority: number;
};
