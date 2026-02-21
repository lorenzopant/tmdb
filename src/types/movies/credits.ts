import { Cast, Crew } from "../common";

/**
 * Cast and crew credits for a movie
 */
export type MovieCredits = {
	/** Movie identifier */
	id: number;
	/** Array of cast members (actors) */
	cast: Cast[];
	/** Array of crew members (directors, writers, etc.) */
	crew: Crew[];
};
