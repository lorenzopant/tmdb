import { MovieResultItem } from "./movies";
import { SearchMoviesParams } from "./params";
import { MediaType } from "./utility";

export type SearchPersonParams = Pick<SearchMoviesParams, "query" | "page" | "include_adult" | "language">;

export type PersonResultItem = {
	adult: boolean;
	gender: number;
	id: number;
	known_for_department: string;
	name: string;
	original_name: string;
	popularity: number;
	profile_path: string;
	known_for: [MovieResultItem & { media_type: MediaType }];
};
