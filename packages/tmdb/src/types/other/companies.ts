import { FileType, ImageItem, WithLanguage } from "../common";
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
export type CompanyImages = {
	/** Unique company identifier */
	id: number;
	/** Logos available for the company */
	logos: ImageItem[];
};

/**
 * Represents a single company logo (slightly different from ImageItem)
 *
 * Note on FileType from TMDB:
 * There are two image formats that are supported for companies, PNG's and SVG's.
 * You can see which type the original file is by looking at the file_type field.
 * We prefer SVG's as they are resolution independent and as such, the width and height are only
 * there to reflect the original asset that was uploaded.
 * An SVG can be scaled properly beyond those dimensions if you call them as a PNG.
 */
export type CompanyImage = Omit<ImageItem, "iso_639_1"> & {
	id: string;
	file_type: FileType;
};

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
