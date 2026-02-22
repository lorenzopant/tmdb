import { AlternativeTitle } from "../common";

/**
 * Alternative titles for a movie in different countries/languages
 */
export type MovieAlternativeTitles = {
	/** Movie identifier */
	id: number;
	/** Array of alternative titles */
	titles: AlternativeTitle[];
};
