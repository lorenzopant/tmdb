import { CountryISO3166_1 } from "../config/countries";
import { Language, LanguageISO6391 } from "../config/languages";
import { WatchMonetizationType } from "../common";
import { ReleaseType } from "../enums";
import { LiteralUnion, Prettify } from "../utility";
import { DiscoverMovieSortBy } from "./movie";
import { DiscoverTVSortBy, DiscoverTVStatus, DiscoverTVType } from "./tv";

/**
 * Comma-separated values are treated as AND filters by TMDB.
 * Pipe-separated values are treated as OR filters by TMDB.
 *
 * The API expects these values serialized as query strings, not arrays.
 */
export type DiscoverFilterExpression<T extends string | number = string | number> = T | `${T}` | string;

type DiscoverBaseParams = {
	include_adult?: boolean;
	language?: Language;
	page?: number;
	sort_by?: string;
	"vote_average.gte"?: number;
	"vote_average.lte"?: number;
	"vote_count.gte"?: number;
	"vote_count.lte"?: number;
	"with_companies"?: DiscoverFilterExpression<number>;
	"with_genres"?: DiscoverFilterExpression<number>;
	"with_keywords"?: DiscoverFilterExpression<number>;
	"with_origin_country"?: CountryISO3166_1;
	"with_original_language"?: LanguageISO6391;
	"with_watch_monetization_types"?: DiscoverFilterExpression<WatchMonetizationType>;
	"with_watch_providers"?: DiscoverFilterExpression<number>;
	"without_companies"?: DiscoverFilterExpression<number>;
	"without_genres"?: DiscoverFilterExpression<number>;
	"without_keywords"?: DiscoverFilterExpression<number>;
	"without_watch_providers"?: DiscoverFilterExpression<number>;
	watch_region?: CountryISO3166_1;
};

/**
 * Query parameters supported by the movie discover endpoint.
 * @reference https://developer.themoviedb.org/reference/discover-movie
 */
export type DiscoverMovieParams = Prettify<
	Omit<DiscoverBaseParams, "sort_by"> & {
		"certification"?: string;
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
		"with_cast"?: DiscoverFilterExpression<number>;
		"with_crew"?: DiscoverFilterExpression<number>;
		"with_people"?: DiscoverFilterExpression<number>;
		"with_release_type"?: DiscoverFilterExpression<ReleaseType>;
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
		"with_networks"?: DiscoverFilterExpression<number>;
		"with_status"?: DiscoverFilterExpression<DiscoverTVStatus>;
		"with_type"?: DiscoverFilterExpression<DiscoverTVType>;
	}
>;
