import { PaginatedResponse } from "../common";
import { MovieResultItem } from "../search";

/**
 * Paginated list of recommended movies based on this movie
 */
export type MovieRecommendations = PaginatedResponse<MovieResultItem>;
