import { PaginatedResponse } from "../common";

/**
 * Paginated list of user reviews for a movie
 */
export type MovieReviews = PaginatedResponse<MovieReview>;

/**
 * Individual movie review with author information
 */
export type MovieReview = {
	/** Review author's display name */
	author: string;
	/** Detailed information about the review author */
	author_details: MovieReviewAuthorDetails;
	/** Full review text content */
	content: string;
	/** Timestamp when the review was created (ISO 8601) */
	created_at: string;
	/** Unique review identifier */
	id: string;
	/** Timestamp of last update (ISO 8601) */
	updated_at: string;
	/** URL to the review on TMDB website */
	url: string;
};

/**
 * Author information for a movie review
 */
export type MovieReviewAuthorDetails = {
	/** Author's full name */
	name: string;
	/** Author's username on TMDB */
	username: string;
	/** Path to author's avatar image (optional) */
	avatar_path?: string;
	/** Rating given by the author (0-10 scale, optional) */
	rating?: number;
};
