import { CountryISO3166_1 } from "./countries";
import { Language, LanguageISO6391 } from "./lang";
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
	language?: Language;
	region?: CountryISO3166_1;
};

export type SearchMoviesParams = {
	query: string;
	include_adult?: boolean;
	language?: Language;
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
	language?: Language;
	page?: number;
	region?: CountryISO3166_1;
};

export type MovieDetailsParams = {
	movie_id: number;
	append_to_response?: MovieAppendToResponseNamespace[];
	language?: Language;
};

export type MovieAlternativeTitlesParams = {
	movie_id: number;
	country?: CountryISO3166_1;
};

export type MovieCreditsParams = {
	movie_id: number;
	language?: Language;
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

/**
 * MovieImagesParams
 * language and include_image_language params still only support
 * ISO_6391 language definition according to TMDB docs:
 *
 * "These are all specified as IETF tags to identify the languages we use on TMDB.
 * There is one exception which is image languages.
 * They are currently only designated by a ISO-639-1 tag. This is a planned upgrade for the future."
 * https://developer.themoviedb.org/reference/configuration-primary-translations
 *
 * But as for my tests, language in format "en-US" is still a valid param and it is accepted.
 * So we allow for both.
 */
export type MovieImagesParams = {
	movie_id: number;
	language?: Language;
	include_image_language?: Language | LanguageISO6391;
};

export type MovieRecommendationsParams = {
	movie_id: number;
	page?: number;
	language?: Language;
};

export type MovieSimilarParams = MovieRecommendationsParams;
export type MovieVideosParams = MovieCreditsParams;
export type MovieReviewsParams = MovieRecommendationsParams;

/** TV Series */
export type TVSeriesListParams = {
	language?: Language;
	page?: number;
	timezone?: Timezone;
};

export type TVDetailsParams = {
	series_id: number;
	append_to_response?: TVAppendToResponseNamespace[];
	language?: Language;
};
