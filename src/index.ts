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
export type {
	SearchMoviesParams,
	MovieDetailsParams,
	MovieListParams,
	PaginatedResponse,
	MovieAlternativeTitlesParams,
} from "./types/params";

// ** Internationalization
export type { CountryISO3166_1 } from "./types/countries";
export { TMDBCountries } from "./types/countries";
export type { LanguageISO6391 } from "./types/lang";
export { Languages } from "./types/lang";
