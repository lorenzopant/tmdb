import { CountryISO3166_1 } from "./countries";
import { LanguageISO6391 } from "./lang";
import { MovieAppendToResponseNamespace } from "./movies";
import { Timezone } from "./timezones";
import { TVAppendToResponseNamespace } from "./tv/tv_series";

export type PaginatedResponse<T> = {
	page: number;
	total_pages: number;
	total_results: number;
	results: T[];
};

export type TMDBCommonParams = {
	language?: LanguageISO6391;
	region?: CountryISO3166_1;
};

export type SearchMoviesParams = {
	query: string;
	include_adult?: boolean;
	language?: LanguageISO6391;
	page?: number;
	primary_release_year?: string;
	region?: CountryISO3166_1;
	year?: string;
};

export type SearchCollectionsParams = Omit<SearchMoviesParams, "primary_release_year" | "year">;
export type SearchKeywordsParams = Pick<SearchMoviesParams, "query" | "page">;
export type SearchCompanyParams = Pick<SearchMoviesParams, "query" | "page">;
export type SearchPersonParams = Pick<SearchMoviesParams, "query" | "page" | "include_adult" | "language">;

export type MovieListParams = {
	language?: LanguageISO6391;
	page?: number;
	region?: CountryISO3166_1;
};

export type MovieDetailsParams = {
	movie_id: number;
	append_to_response?: MovieAppendToResponseNamespace[];
	language?: LanguageISO6391;
};

export type MovieAlternativeTitlesParams = {
	movie_id: number;
	country?: CountryISO3166_1;
};

export type MovieCreditsParams = {
	movie_id: number;
	language?: LanguageISO6391;
};

export type MovieKeywordsParams = { movie_id: number };
export type MovieExternalIDsParams = MovieKeywordsParams;
export type MovieReleaseDatesParams = MovieKeywordsParams;
export type MovieTranslationsParams = MovieKeywordsParams;
export type MovieWatchProvidersParams = MovieKeywordsParams;

export type MovieChangesParams = {
	movie_id: number;
	page?: number;
	start_date?: string;
	end_date?: string;
};

export type MovieImagesParams = {
	movie_id: number;
	language?: LanguageISO6391;
	include_image_language?: LanguageISO6391;
};

export type MovieRecommendationsParams = {
	movie_id: number;
	page?: number;
	language?: LanguageISO6391;
};

export type MovieSimilarParams = MovieRecommendationsParams;
export type MovieVideosParams = MovieCreditsParams;
export type MovieReviewsParams = MovieRecommendationsParams;

/** TV Series */
export type TVSeriesListParams = {
	language?: LanguageISO6391;
	page?: number;
	timezone?: Timezone;
};

export type TVDetailsParams = {
	series_id: number;
	append_to_response?: TVAppendToResponseNamespace[];
	language?: LanguageISO6391;
};
