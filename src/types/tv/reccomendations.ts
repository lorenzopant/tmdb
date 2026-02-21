import { PaginatedResponse } from "../common";
import { TVSeriesResultItem } from "./tv_series";

/** List of TV shows that are recommended for a TV show. */
export type TVRecommendations = PaginatedResponse<TVSeriesResultItem>;
