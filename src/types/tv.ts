import { CountryISO3166_1 } from "./countries";

export type TVSeriesResultItem = {
	backdrop_path: string;
	first_air_date: string;
	genre_ids: number[];
	id: number;
	name: string;
	origin_country: CountryISO3166_1[];
	original_language: string;
	overview: string;
	popularity: number;
	poster_path: string;
	vote_average: number;
	vote_count: number;
	title: string;
	original_title: string;
};
