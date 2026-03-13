import { TVBaseParam } from "../tv/params";

/**
 * Almost every query within the TV Series Seasons domain
 * will take this required param to identify the
 * tv show season.
 */
export type TVSeasonBaseParams = TVBaseParam & {
	/** The Season */
	season_number: number;
};

/** Uniquely identifies a season across different tv shows. */
export type TVSeasonId = {
	season_id: string;
};
