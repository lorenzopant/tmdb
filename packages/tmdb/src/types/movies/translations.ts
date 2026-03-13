import { TranslationResults } from "../common";

/**
 * Movie translations containing all available language versions
 */
export type MovieTranslations = TranslationResults<MovieTranslationData>;

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
