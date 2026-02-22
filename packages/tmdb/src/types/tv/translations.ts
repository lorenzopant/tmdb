import { Translation } from "../common";

/**
 * Represents the collection of available translations for a TV series.
 */
export type TVTranslations = {
	/** The unique identifier of the TV series. */
	id: number;
	/** The list of available translations for this TV series. */
	translations: TVTranslationItem[];
};

/**
 * Represents a single translation entry for a TV series,
 * extending the base `Translation` type with TV-specific translated data.
 */
export type TVTranslationItem = Translation & {
	/** The translated content fields for this TV series. */
	data: TVTranslationData;
};

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
