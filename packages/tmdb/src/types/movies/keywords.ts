import { Keyword } from "../common";

/**
 * Keywords/tags associated with a movie
 */
export type MovieKeywords = {
	/** Movie identifier */
	id: number;
	/** Array of keyword objects */
	keywords: Keyword[];
};
