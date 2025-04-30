// src/index.ts

export { TMDB } from "./tmdb";
export { TMDBError } from "./errors/tmdb";

export type {
	MovieDetails,
	MovieAlternativeTitle,
	MovieAlternativeTitles,
	MovieCredits,
	MovieExternalIDs,
	MovieImages,
	MovieKeywords,
	MovieReleaseDates,
	MovieTranslations,
	MovieVideos,
} from "./types/movies";
export type {
	Changes,
	Collection,
	Genre,
	ImageItem,
	Keyword,
	ProductionCompany,
	ProductionCountry,
	SpokenLanguage,
	VideoItem,
	Cast,
	Crew,
} from "./types/common";
