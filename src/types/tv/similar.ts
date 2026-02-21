import { PaginatedResponse } from "../common";
import { TVSeriesResultItem } from "./tv_series";

/** List of TV shows that are similar to a TV show. */
export type TVSimilar = PaginatedResponse<TVSeriesResultItem>;
