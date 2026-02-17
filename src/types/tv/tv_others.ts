import { Cast, Crew, ImageItem, Keyword, VideoItem } from "../common";
import { PaginatedResponse } from "../params";
import { TVAggregateCreditsCastItem, TVAggregateCreditsCrewItem } from "./tv_credits";
import { TVSeriesResultItem } from "./tv_series";

/**
 * This is the original TV credits method which returns the latest season credit data.
 * If you would like to request the aggregate view (which is what you see on the TMDB website)
 * you should use the aggregate_credits method.
 */
export type TVCredits = {
	/** TMDB unique identifier for the TV show. */
	id: number;

	/** List of all the known cast for the TV show. */
	cast: Cast[];

	/** List of all the known crew members for the TV show. */
	crew: Crew[];
};

/**
 * List of keywords related to the TV show.
 */
export type TVKeywords = {
	/** TMDB unique identifier for the TV show. */
	id: number;

	/** List of keywords related to the TV show. */
	results: Keyword[];
};

/**
 * Images related to a TV show.
 * Contains backdrops, logos, posters and stills.
 */
export type TVImages = {
	/** TMDB unique identifier for the TV show. */
	id: number;

	/** List of backdrop images for the TV show. */
	backdrops: ImageItem[];

	/** List of logo images for the TV show. */
	logos: ImageItem[];

	/** List of poster images for the TV show. */
	posters: ImageItem[];

	/** List of still images for the TV show. */
	stills?: ImageItem[];
};

/**
 * External identifiers for a TV show.
 * TODO: Check on null types (also for movies external IDs)
 */
export type TVExternalIDs = {
	/** TMDB unique identifier for the TV show. */
	id: number;
	/** IMDb identifier string, or undefined if unavailable. */
	imdb_id?: string;
	/** Facebook identifier string, or undefined if unavailable. */
	facebook_id?: string;
	/** Twitter identifier string, or undefined if unavailable. */
	twitter_id?: string;
	/** Instagram identifier string, or undefined if unavailable. */
	instagram_id?: string;
};

/** List of videos related to a TV show. */
export type TVVideos = {
	/** TMDB unique identifier for the TV show. */
	id: number;

	/** List of video results. */
	results: VideoItem[];
};

/** List of TV shows that are recommended for a TV show. */
export type TVRecommendations = PaginatedResponse<TVSeriesResultItem>;

/** List of TV shows that are similar to a TV show. */
export type TVSimilar = PaginatedResponse<TVSeriesResultItem>;

/**
 * Aggregate credits for a TV show, including cast and crew across all seasons and episodes.
 */
export type TVAggregateCredits = {
	/** TMDB unique identifier for the TV show. */
	id: number;

	/** List of all the known cast for the TV show. */
	cast: TVAggregateCreditsCastItem[];

	/** List of all the known crew members for the TV show. */
	crew: TVAggregateCreditsCrewItem[];
};
