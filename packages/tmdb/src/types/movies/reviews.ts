import { PaginatedResponse, Review } from "../common";

/**
 * Paginated list of user reviews for a movie
 */
export type MovieReviews = PaginatedResponse<Review>;
