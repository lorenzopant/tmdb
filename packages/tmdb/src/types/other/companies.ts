import { WithLanguage } from "../common";
import { ImagesResult, OrganizationImage } from "../common/images";
import { CountryISO3166_1 } from "../config/countries";
import { Language, LanguageISO6391 } from "../config/languages";

/**
 * Minimal company data reused across company-related responses.
 */
export type CompanySummary = {
	/** Unique company identifier */
	id: number;
	/** Relative path to the company logo */
	logo_path?: string | null;
	/** Company display name */
	name: string;
};

/**
 * Detailed company information returned by `/company/{company_id}`.
 */
export type Company = CompanySummary & {
	/** ISO 3166-1 country code of origin */
	origin_country: CountryISO3166_1;
	/** Company description or biography */
	description: string;
	/** Company headquarters location */
	headquarters: string;
	/** Official company homepage */
	homepage: string | null;
	/** Parent company, if TMDB links one */
	parent_company?: CompanySummary | null;
};

/**
 * A single alternative company name entry.
 */
export type CompanyAlternativeName = {
	/** Alternative company name */
	name: string;
	/** Optional classification for the name */
	type: string;
};

/**
 * Alternative names response for a company.
 */
export type CompanyAlternativeNames = {
	/** Unique company identifier */
	id: number;
	/** List of alternative names associated with the company */
	results: CompanyAlternativeName[];
};

/**
 * Company logo images returned by `/company/{company_id}/images`.
 */
export type CompanyImages = ImagesResult<OrganizationImage, "logos">;

/** Base param used by all company queries */
export type CompanyBaseParam = {
	/** Uniquely identifies a company in TMDB. */
	company_id: number;
};

export type CompanyDetailsParams = CompanyBaseParam;
export type CompanyAlternativeNamesParams = CompanyBaseParam;
export type CompanyImagesParams = CompanyBaseParam & {
	include_image_language?: Language | LanguageISO6391;
} & WithLanguage;
