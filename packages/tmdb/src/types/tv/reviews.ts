import { PaginatedResponse, Review } from "../common";

/**
 * Paginated list of user reviews for a tv show
 */
export type TVReviews = PaginatedResponse<Review>;
