import { PaginatedResponse } from "../common";
import { MovieResultItem } from "../search";

/**
 * Paginated list of movies similar to this movie
 */
export type MovieSimilar = PaginatedResponse<MovieResultItem>;
