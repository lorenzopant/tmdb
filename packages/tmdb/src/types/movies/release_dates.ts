import { ReleaseType } from "../enums";

/**
 * Release dates and certifications across different countries
 */
export type MovieReleaseDates = {
	/** Movie identifier */
	id: number;
	/** Array of release date results grouped by country */
	results: MovieReleaseDateResult[];
};

/**
 * Release dates for a specific country
 */
export type MovieReleaseDateResult = {
	/** ISO 3166-1 country code */
	iso_3166_1: string;
	/** Array of release dates (movies can have multiple releases per country) */
	release_dates: MovieReleaseDate[];
};

/**
 * Individual release date entry with certification
 */
export type MovieReleaseDate = {
	/** Age certification/rating (e.g., "PG-13", "R", "12A") */
	certification: string;
	/** ISO 639-1 language code */
	iso_639_1: string;
	/** Release date and time in ISO 8601 format */
	release_date: string;
	/** Type of release (1=Premiere, 2=Theatrical (limited), 3=Theatrical, 4=Digital, 5=Physical, 6=TV) */
	type: ReleaseType | number;
	/** Additional notes about this release */
	note: string;
	/** Content descriptors (currently unused by TMDB) */
	descriptors: unknown[];
};
