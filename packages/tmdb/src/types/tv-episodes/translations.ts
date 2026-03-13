import { TranslationResults } from "../common";

export type TVEpisodeTranslations = TranslationResults<TVEpisodeTranslation>;

// TODO: Refactor this -> TranslationResults<T> -> Translation<T>
export type TVEpisodeTranslation = {
	name?: string | null;
	overview?: string | null;
};
