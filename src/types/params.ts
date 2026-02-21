import { CountryISO3166_1 } from "./config/countries";
import { Language } from "./config/languages";

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
