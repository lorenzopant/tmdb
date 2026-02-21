import { PaginatedResponse } from "../common";
import { MovieResultItem } from "./movie";

/**
 * Paginated list of movies similar to this movie
 */
export type MovieSimilar = PaginatedResponse<MovieResultItem>;
