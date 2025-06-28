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
	region?: string;
	year?: string;
};

export type MovieDetailsParams = {
	movie_id: number;
	append_to_response?: string[];
	language?: LanguageISO6391;
};

export type MovieAlternativeTitlesParams = {
	movie_id: number;
	country?: string;
};
