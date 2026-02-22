import { PaginatedResponse } from "../common";
import { TVSeriesResultItem } from "../search";

/** List of TV shows that are recommended for a TV show. */
export type TVRecommendations = PaginatedResponse<TVSeriesResultItem>;
