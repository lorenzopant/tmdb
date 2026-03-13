import { Translation } from "../common";

export type TVEpisodeTranslations = {
	id: number | string;
	translations: TVEpisodeTranslation[];
};

// TODO: Refactor this -> TranslationResults<T> -> Translation<T>
export type TVEpisodeTranslation = Translation & {
	data: {
		name?: string | null;
		overview?: string | null;
	};
};
