/**
 * Alternative titles for a movie in different countries/languages
 */
export type MovieAlternativeTitles = {
	/** Movie identifier */
	id: number;
	/** Array of alternative titles */
	titles: MovieAlternativeTitle[];
};

/**
 * Individual alternative title entry
 */
export type MovieAlternativeTitle = {
	/** Alternative title text */
	title: string;
	/** ISO 3166-1 country code where this title is used */
	iso_3166_1: string;
	/** Type of title (e.g., "original title", "working title") */
	type: string;
};
