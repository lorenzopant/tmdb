/**
 * Movie translations containing all available language versions
 */
export type MovieTranslations = {
	/** Movie identifier */
	id: number;
	/** Array of translations in different languages */
	translations: MovieTranslationResults[];
};

/**
 * Translation data for a specific language
 */
export type MovieTranslationResults = {
	/** ISO 3166-1 alpha-2 country code */
	iso_3166_1: string;
	/** ISO 639-1 language code */
	iso_639_1: string;
	/** Native name of the language */
	name: string;
	/** English name of the language */
	english_name: string;
	/** Translated movie information */
	data: {
		/** Translated homepage URL */
		homepage: string;
		/** Translated synopsis/overview */
		overview: string;
		/** Movie runtime in minutes */
		runtime: number;
		/** Translated tagline */
		tagline: string;
		/** Translated movie title */
		title: string;
	};
};
