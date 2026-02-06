import { CountryISO3166_1 } from "./countries";
import { SearchMoviesParams } from "./params";

export type SearchCompanyParams = Pick<SearchMoviesParams, "query" | "page">;

export type SearchCompanyItem = {
	id: number;
	logo_path: string;
	name: string;
	origin_country: CountryISO3166_1;
};
