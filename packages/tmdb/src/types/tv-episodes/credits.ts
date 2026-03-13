import { Cast, Crew } from "../common";

export type TVEpisodeCredits = {
	id: number | string;
	cast: Omit<Cast, "cast_id">[];
	crew: Crew[];
	guest_stars: Omit<Cast, "cast_id">[];
};
