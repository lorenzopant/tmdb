import { CountryISO3166_1 } from "./countries";
import { LanguageISO6391 } from "./lang";

export type PaginatedResponse<T> = {
	page: number;
	total_pages: number;
	total_results: number;
	results: T[];
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

export type MovieListParams = {
	language?: LanguageISO6391;
	page?: number;
	region?: CountryISO3166_1;
};

export type MovieDetailsParams = {
	movie_id: number;
	append_to_response?: string[];
	language?: LanguageISO6391;
};

export type MovieAlternativeTitlesParams = {
	movie_id: number;
	country?: CountryISO3166_1;
};
