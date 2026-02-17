import { Credit } from "../common";

/**
 * Cast member in TV show aggregate credits with their roles across all seasons.
 */
export type TVAggregateCreditsCastItem = Omit<Credit, "credit_id"> & {
	/** Array of roles played by this cast member across different episodes */
	roles: TVCreditRole[];

	/** Total number of episodes this cast member appeared in */
	total_episode_count: number;

	/** Position in the cast list */
	order: number;
};

/**
 * Crew member in TV show aggregate credits with their jobs across all seasons.
 */
export type TVAggregateCreditsCrewItem = Omit<Credit, "credit_id"> & {
	/** Array of jobs performed by this crew member across different episodes */
	jobs: TVCreditJob[];

	/** Total number of episodes this crew member worked on */
	total_episode_count: number;

	/** Department the crew member belongs to (e.g., "Directing", "Writing") */
	department: string;
};

/**
 * Represents a specific role a cast member played in a TV show.
 */
type TVCreditRole = {
	/** Unique identifier for this specific credit */
	credit_id: string;

	/** Character name played in this role */
	character: string;

	/** Number of episodes in which this character appeared */
	episode_count: number;
};

/**
 * Represents a specific job a crew member performed on a TV show.
 */
type TVCreditJob = {
	/** Unique identifier for this specific credit */
	credit_id: string;

	/** Job title (e.g., "Director", "Writer", "Producer") */
	job: string;

	/** Number of episodes for which this job was performed */
	episode_count: number;
};
