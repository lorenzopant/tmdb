import { WatchMonetizationType } from "./common";
import { CountryISO3166_1, Language, LanguageISO6391 } from "./config";
import { DiscoverTVStatus, DiscoverTVType, MovieReleaseType } from "./enums";
import { LiteralUnion, Prettify } from "./utility";

/**
 * Supported sort options for the movie discover endpoint.
 * @reference https://developer.themoviedb.org/reference/discover-movie
 */
export type DiscoverMovieSortBy =
	| "original_title.asc"
	| "original_title.desc"
	| "popularity.asc"
	| "popularity.desc"
	| "revenue.asc"
	| "revenue.desc"
	| "primary_release_date.asc"
	| "primary_release_date.desc"
	| "title.asc"
	| "title.desc"
	| "vote_average.asc"
	| "vote_average.desc"
	| "vote_count.asc"
	| "vote_count.desc";

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
 * A TV result item as returned by discover endpoints.
 */
export type DiscoverTVResultItem = {
	adult: boolean;
	backdrop_path?: string;
	first_air_date: string;
	genre_ids: number[];
	id: number;
	name: string;
	origin_country: CountryISO3166_1[];
	original_language: string;
	original_name: string;
	overview: string;
	popularity: number;
	poster_path?: string;
	softcore: boolean;
	vote_average: number;
	vote_count: number;
};

/**
 * Comma-separated values are treated as AND filters by TMDB.
 * Pipe-separated values are treated as OR filters by TMDB.
 *
 * The API expects these values serialized as query strings, not arrays.
 */
export type DiscoverFilterExpression<T extends string | number = string | number> = T | string;

type DiscoverBaseParams = {
	include_adult?: boolean;
	language?: Language;
	page?: number;
	sort_by?: string;
	"vote_average.gte"?: number;
	"vote_average.lte"?: number;
	"vote_count.gte"?: number;
	"vote_count.lte"?: number;
	with_companies?: DiscoverFilterExpression<number>;
	with_genres?: DiscoverFilterExpression<number>;
	with_keywords?: DiscoverFilterExpression<number>;
	with_origin_country?: CountryISO3166_1;
	with_original_language?: LanguageISO6391;
	with_watch_monetization_types?: DiscoverFilterExpression<WatchMonetizationType>;
	with_watch_providers?: DiscoverFilterExpression<number>;
	without_companies?: DiscoverFilterExpression<number>;
	without_genres?: DiscoverFilterExpression<number>;
	without_keywords?: DiscoverFilterExpression<number>;
	without_watch_providers?: DiscoverFilterExpression<number>;
	watch_region?: CountryISO3166_1;
};

/**
 * Query parameters supported by the movie discover endpoint.
 * @reference https://developer.themoviedb.org/reference/discover-movie
 */
export type DiscoverMovieParams = Prettify<
	Omit<DiscoverBaseParams, "sort_by"> & {
		certification?: string;
		"certification.gte"?: string;
		"certification.lte"?: string;
		certification_country?: CountryISO3166_1;
		include_video?: boolean;
		"primary_release_date.gte"?: string;
		"primary_release_date.lte"?: string;
		primary_release_year?: number;
		region?: CountryISO3166_1;
		"release_date.gte"?: string;
		"release_date.lte"?: string;
		sort_by?: DiscoverMovieSortBy;
		with_cast?: DiscoverFilterExpression<number>;
		with_crew?: DiscoverFilterExpression<number>;
		with_people?: DiscoverFilterExpression<number>;
		with_release_type?: DiscoverFilterExpression<MovieReleaseType>;
		"with_runtime.gte"?: number;
		"with_runtime.lte"?: number;
		year?: number;
	}
>;

/**
 * Query parameters supported by the TV discover endpoint.
 * @reference https://developer.themoviedb.org/reference/discover-tv
 */
export type DiscoverTVParams = Prettify<
	Omit<DiscoverBaseParams, "sort_by"> & {
		"air_date.gte"?: string;
		"air_date.lte"?: string;
		"first_air_date.gte"?: string;
		"first_air_date.lte"?: string;
		first_air_date_year?: number;
		include_null_first_air_dates?: boolean;
		sort_by?: DiscoverTVSortBy;
		screened_theatrically?: boolean;
		timezone?: LiteralUnion<string>;
		with_networks?: DiscoverFilterExpression<number>;
		with_status?: DiscoverFilterExpression<DiscoverTVStatus>;
		with_type?: DiscoverFilterExpression<DiscoverTVType>;
	}
>;
