import { Credit, MediaType, WithLanguage } from "../common";
import type { LiteralUnion } from "../utility";

/**
 * Base params used by all credit queries.
 */
export type CreditBaseParam = {
	/** TMDB credit identifier. */
	credit_id: string;
};

export type CreditDetailsParams = CreditBaseParam & WithLanguage;

/**
 * Person data attached to a credit details response.
 */
export type CreditDetailsPerson = Omit<Credit, "credit_id">;

type CreditDetailsMediaBase = {
	/** Indicates whether the title is marked for adult content. */
	adult: boolean;
	/** Relative path to the backdrop image, if available. */
	backdrop_path?: string | null;
	/** Character name when the credit belongs to cast. */
	character?: string;
	/** Genre identifiers attached to the media item. */
	genre_ids: number[];
	/** TMDB media identifier. */
	id: number;
	/** Original language code. */
	original_language: string;
	/** Plot summary. */
	overview: string;
	/** Relative path to the poster image, if available. */
	poster_path?: string | null;
	/** Popularity score. */
	popularity: number;
	/** Average vote score. */
	vote_average: number;
	/** Total vote count. */
	vote_count: number;
};

/**
 * Movie data attached to a credit details response.
 */
export type CreditDetailsMovieMedia = CreditDetailsMediaBase & {
	/** Media type discriminator. */
	media_type: "movie";
	/** Original movie title. */
	original_title: string;
	/** Release date in ISO 8601 format. */
	release_date: string;
	/** Localized movie title. */
	title: string;
	/** Whether the movie has an associated video. */
	video: boolean;
};

/**
 * TV episode summary embedded in a TV credit details response.
 */
export type CreditDetailsTVEpisode = {
	/** Indicates whether the episode is marked for adult content. */
	adult: boolean;
	/** Episode air date in ISO 8601 format, if available. */
	air_date?: string | null;
	/** Episode number within the season. */
	episode_number: number;
	/** Episode type reported by TMDB. */
	episode_type: string;
	/** Unique episode identifier. */
	id: number;
	/** Episode title. */
	name: string;
	/** Plot summary. */
	overview: string;
	/** Production code if available. */
	production_code: string;
	/** Runtime in minutes, if available. */
	runtime?: number | null;
	/** Season number for the episode. */
	season_number: number;
	/** Episode still image path, if available. */
	still_path?: string | null;
	/** Average vote score. */
	vote_average: number;
	/** Total vote count. */
	vote_count: number;
};

/**
 * TV season summary embedded in a TV credit details response.
 */
export type CreditDetailsTVSeason = {
	/** Season air date in ISO 8601 format, if available. */
	air_date?: string | null;
	/** Total number of episodes in the season. */
	episode_count: number;
	/** Unique season identifier. */
	id: number;
	/** Season title. */
	name: string;
	/** Plot summary. */
	overview: string;
	/** Relative path to the season poster, if available. */
	poster_path?: string | null;
	/** Season number within the series. */
	season_number: number;
	/** Average vote score. */
	vote_average: number;
};

/**
 * TV series data attached to a credit details response.
 */
export type CreditDetailsTVMedia = CreditDetailsMediaBase & {
	/** TV episodes attached to the specific credit. */
	episodes: CreditDetailsTVEpisode[];
	/** First air date in ISO 8601 format. */
	first_air_date: string;
	/** Localized series name. */
	name: string;
	/** Origin country codes. */
	origin_country: string[];
	/** Original series name. */
	original_name: string;
	/** Seasons attached to the specific credit. */
	seasons: CreditDetailsTVSeason[];
	/** Media type discriminator. */
	media_type: "tv";
};

/**
 * Media item returned by `/credit/{credit_id}`.
 */
export type CreditDetailsMedia = CreditDetailsMovieMedia | CreditDetailsTVMedia;

/**
 * Detailed credit information returned by `/credit/{credit_id}`.
 */
export type CreditDetails = {
	/** Cast or crew discriminator returned by TMDB. */
	credit_type: LiteralUnion<"cast" | "crew">;
	/** Department associated with the credit. */
	department: string;
	/** Unique credit identifier. */
	id: string;
	/** Job associated with the credit. */
	job: string;
	/** Media type discriminator for the attached media payload. */
	media_type: MediaType;
	/** Movie or TV title linked to the credit. */
	media: CreditDetailsMedia;
	/** Person linked to the credit. */
	person: CreditDetailsPerson;
};
