import { CountryISO3166_1 } from "./config";
import { Language } from "./config/languages";
import { LiteralUnion } from "./utility";

/**
 * External source values accepted by TMDB's find-by-id endpoint.
 * @reference https://developer.themoviedb.org/reference/find-by-id
 */
export type FindExternalSource = LiteralUnion<
	"imdb_id" | "tvdb_id" | "freebase_mid" | "freebase_id" | "tvrage_id" | "facebook_id" | "instagram_id" | "twitter_id"
>;

/**
 * Parameters for TMDB's find-by-id endpoint.
 * `external_id` is sent in the request path and `external_source` as a query param.
 */
export type FindByIDParams = {
	external_id: string;
	external_source: FindExternalSource;
	language?: Language;
};

type FindMediaResultBase = {
	adult: boolean;
	backdrop_path: string | null;
	id: number;
	original_language: string;
	overview: string;
	poster_path: string | null;
	popularity: number;
	vote_average: number;
	vote_count: number;
};

/**
 * Movie item returned inside `movie_results`.
 */
export type FindMovieResultItem = FindMediaResultBase & {
	media_type: "movie";
	original_title: string;
	release_date: string;
	title: string;
	video: boolean;
};

/**
 * Person item returned inside `person_results`.
 */
export type FindPersonResultItem = {
	adult: boolean;
	gender: number | null;
	id: number;
	known_for_department: string;
	media_type: "person";
	name: string;
	original_name: string;
	popularity: number;
	profile_path: string | null;
};

/**
 * TV series item returned inside `tv_results`.
 */
export type FindTVResultItem = FindMediaResultBase & {
	media_type: "tv";
	first_air_date: string;
	name: string;
	origin_country: CountryISO3166_1[];
	original_name: string;
};

/**
 * TV episode item returned inside `tv_episode_results`.
 */
export type FindTVEpisodeResultItem = {
	air_date: string;
	episode_number: number;
	id: number;
	media_type: "tv_episode";
	name: string;
	overview: string;
	production_code: string;
	season_number: number;
	show_id: number;
	still_path: string | null;
	vote_average: number;
	vote_count: number;
};

/**
 * TV season item returned inside `tv_season_results`.
 */
export type FindTVSeasonResultItem = {
	air_date: string;
	episode_count: number;
	id: number;
	media_type: "tv_season";
	name: string;
	overview: string;
	poster_path: string | null;
	season_number: number;
};

/**
 * Response returned by TMDB's find-by-id endpoint.
 */
export type FindResults = {
	movie_results: FindMovieResultItem[];
	person_results: FindPersonResultItem[];
	tv_results: FindTVResultItem[];
	tv_episode_results: FindTVEpisodeResultItem[];
	tv_season_results: FindTVSeasonResultItem[];
};
