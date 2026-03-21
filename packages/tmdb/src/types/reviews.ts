import type { Review } from "./common/media";

// MARK: Details

/**
 * Full details for a single TMDB review, as returned by GET /review/{review_id}.
 * Extends the base Review type with media context fields.
 */
export type ReviewDetails = Review & {
	/** ISO 639-1 language code of the review content */
	iso_639_1: string;
	/** The TMDB ID of the reviewed media */
	media_id: number;
	/** The title of the reviewed media */
	media_title: string;
	/** The type of media being reviewed */
	media_type: "movie" | "tv";
};

// MARK: Params

/**
 * Parameters for fetching a review by its TMDB review ID.
 */
export type ReviewDetailsParams = {
	/** The TMDB review identifier */
	review_id: string;
};
