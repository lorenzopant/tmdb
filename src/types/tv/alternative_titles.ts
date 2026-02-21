import { AlternativeTitle } from "../common";

/**
 * Alternative titles for a tv show in different countries/languages
 */
export type TVAlternativeTitles = {
	/** Movie identifier */
	id: number;
	/** Array of alternative titles */
	results: AlternativeTitle[];
};
