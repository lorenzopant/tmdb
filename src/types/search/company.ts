import { CountryISO3166_1 } from "../config/countries";

/**
 * Company information in search results
 */
export type SearchCompanyItem = {
	/** Unique company identifier */
	id: number;
	/** Path to company logo image */
	logo_path: string;
	/** Company name */
	name: string;
	/** ISO 3166-1 country code of company's origin */
	origin_country: CountryISO3166_1;
};
