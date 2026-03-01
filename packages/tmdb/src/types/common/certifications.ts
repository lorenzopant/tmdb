import { CountryISO3166_1 } from "../config";

/**
 * Represents a content rating certification for a movie or TV show.
 */
export type CertificationItem = {
	/** The certification label as defined by the rating authority (e.g. `PG-13`, `18+`, `R`) */
	certification: string;
	/** A human-readable description of the audience this certification targets or restricts */
	meaning?: string;
	/** The display order of this certification relative to others in the same rating system */
	order?: number;
};

/**
 * A map of content rating certifications grouped by country.
 */
export type Certifications = {
	/** A record mapping each country (ISO 3166-1 alpha-2 code) to its list of applicable certifications */
	certifications: Record<CountryISO3166_1, CertificationItem[]>;
};
