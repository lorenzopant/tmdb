import { Cast, Crew, Genre, ImageItem, Keyword, ProductionCompany, ProductionCountry, SpokenLanguage, VideoItem } from "./common";
import { CountryISO3166_1 } from "./countries";
import { NetworkItem } from "./networks";
import { PaginatedResponse } from "./params";
import { TVEpisodeItem } from "./tv_episodes";
import { TVSeasonItem } from "./tv_seasons";

/**
 * A single TV series result as returned by TMDB APIs.
 *
 * Contains identifiers, localized and original titles, image path references,
 * release and origin information, genre ids, and popularity/vote statistics.
 * It is a partial representation of the TVDetail type.
 */
export type TVSeriesResultItem = {
	/** Relative path to the backdrop image for the series (nullable on some responses). */
	backdrop_path: string;
	/** First air date of the series (YYYY-MM-DD). */
	first_air_date: string;
	/** Array of genre ids associated with the series. */
	genre_ids: number[];
	/** Unique TMDB id for the series. */
	id: number;
	/** Series name (localized). */
	name: string;
	/** Origin country codes for the series (ISO 3166-1). */
	origin_country: CountryISO3166_1[];
	/** Original language code (ISO 639-1). */
	original_language: string;
	/** Brief synopsis/overview of the series. */
	overview: string;
	/** Popularity score as returned by TMDB. */
	popularity: number;
	/** Relative path to the poster image for the series (nullable on some responses). */
	poster_path: string;
	/** Average vote score for the series. */
	vote_average: number;
	/** Total number of votes the series has received. */
	vote_count: number;
	/** Localized or display title for the series (may match name). */
	title: string;
	/** Original (non-localized) title of the series. */
	original_title: string;
};

export type TVCredits = {
	id: number;
	cast: Cast[];
	crew: Crew[];
};

export type TVExternalIDs = {
	id: number;
	imdb_id: string | null;
	facebook_id: string | null;
	twitter_id: string | null;
	instagram_id: string | null;
};

export type TVKeywords = { id: number; results: Keyword[] };

export type TVImages = {
	id: number;
	backdrops: ImageItem[];
	logos: ImageItem[];
	posters: ImageItem[];
	stills?: ImageItem[];
};

export type TVVideos = { id: number; results: VideoItem[] };

export type TVRecommendations = PaginatedResponse<TVSeriesResultItem>;
export type TVSimilar = PaginatedResponse<TVSeriesResultItem>;

export type TVDetails = {
	backdrop_path: string | null;
	created_by: { id: number; credit_id: string; name: string; gender?: number; profile_path?: string }[];
	episode_run_time: number[];
	first_air_date: string;
	genres: Genre[];
	homepage: string | null;
	id: number;
	in_production: boolean;
	languages: string[];
	last_air_date: string;
	last_episode_to_air?: TVEpisodeItem;
	name: string;
	next_episode_to_air?: TVEpisodeItem;
	networks?: NetworkItem[];
	number_of_episodes: number;
	number_of_seasons: number;
	origin_country: CountryISO3166_1[];
	original_language: string;
	original_name: string;
	overview: string | null;
	popularity: number;
	poster_path: string | null;
	production_companies?: ProductionCompany[];
	production_countries?: ProductionCountry[];
	seasons?: TVSeasonItem[];
	spoken_languages?: SpokenLanguage[];
	status?: string;
	type?: string;
	vote_average: number;
	vote_count: number;
};

/** Append To Response */
export type TVAppendToResponseNamespace =
	| "credits"
	| "external_ids"
	| "images"
	| "keywords"
	| "recommendations"
	| "similar"
	| "translations"
	| "videos";

export type TVAppendableMap = {
	credits: TVCredits;
	external_ids: TVExternalIDs;
	images: TVImages;
	keywords: TVKeywords;
	recommendations: TVRecommendations;
	similar: TVSimilar;
	translations: unknown; // translations structure is variable
	videos: TVVideos;
};

export type TVDetailsWithAppends<T extends readonly TVAppendToResponseNamespace[]> = TVDetails & {
	[K in T[number]]: TVAppendableMap[K];
};
