import { TranslationResults } from "../common";

/**
 * Represents the collection of available translations for a TV series.
 */
export type TVTranslations = TranslationResults<TVTranslationData>;

/**
 * The translated text fields for a TV series in a specific language.
 * All fields are optional as not every translation may provide all values.
 */
export type TVTranslationData = {
	/** The translated name of the TV series. */
	name?: string;
	/** The translated overview or synopsis of the TV series. */
	overview?: string;
	/** The translated homepage URL for the TV series. */
	homepage?: string;
	/** The translated tagline of the TV series. */
	tagline?: string;
};
