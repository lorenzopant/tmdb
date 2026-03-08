import { CountryISO3166_1 } from "../config";

/**
 * Supported sort options for the TV discover endpoint.
 * @reference https://developer.themoviedb.org/reference/discover-tv
 */
export type DiscoverTVSortBy =
	| "first_air_date.asc"
	| "first_air_date.desc"
	| "name.asc"
	| "name.desc"
	| "original_name.asc"
	| "original_name.desc"
	| "popularity.asc"
	| "popularity.desc"
	| "vote_average.asc"
	| "vote_average.desc"
	| "vote_count.asc"
	| "vote_count.desc";

/**
 * TV status values accepted by TMDB discover filters.
 * @reference https://developer.themoviedb.org/reference/discover-tv
 */
export enum DiscoverTVStatus {
	ReturningSeries = 0,
	Planned = 1,
	InProduction = 2,
	Ended = 3,
	Canceled = 4,
	Pilot = 5,
}

/**
 * TV type values accepted by TMDB discover filters.
 * @reference https://developer.themoviedb.org/reference/discover-tv
 */
export enum DiscoverTVType {
	Documentary = 0,
	News = 1,
	Miniseries = 2,
	Reality = 3,
	Scripted = 4,
	TalkShow = 5,
	Video = 6,
}

/**
 * A TV result item as returned by discover endpoints.
 */
export type DiscoverTVResultItem = {
	backdrop_path: string | null;
	first_air_date: string;
	genre_ids: number[];
	id: number;
	name: string;
	origin_country: CountryISO3166_1[];
	original_language: string;
	original_name: string;
	overview: string;
	popularity: number;
	poster_path: string | null;
	vote_average: number;
	vote_count: number;
};
