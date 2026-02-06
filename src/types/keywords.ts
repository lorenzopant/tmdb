import { SearchMoviesParams } from "./params";

export type SearchKeywordsParams = Pick<SearchMoviesParams, "query" | "page">;

export type SearchKeywordItem = {
	id: number;
	name: string;
};
