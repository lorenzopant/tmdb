import { Translation } from "../common";

/**
 * Movie translations containing all available language versions
 */
export type MovieTranslations = {
	/** Movie identifier */
	id: number;
	/** Array of translations in different languages */
	translations: MovieTranslationItem[];
};

export type MovieTranslationItem = Translation & {
	data: MovieTranslationData;
};

/**
 * Translation data for a specific language
 */
export type MovieTranslationData = {
	/** Translated homepage URL */
	homepage?: string;
	/** Translated synopsis/overview */
	overview?: string;
	/** Movie runtime in minutes */
	runtime?: number;
	/** Translated tagline */
	tagline?: string;
	/** Translated movie title */
	title?: string;
};
