import { MovieResultItem } from "./movies";
import { MediaType } from "./utility";

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
