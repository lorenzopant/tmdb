import { PaginatedResponse } from "../common";
import { TVSeriesResultItem } from "../search";

/** List of TV shows that are similar to a TV show. */
export type TVSimilar = PaginatedResponse<TVSeriesResultItem>;
