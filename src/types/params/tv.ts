import { Timezone } from "../timezones";
import { TVAppendToResponseNamespace } from "../tv/tv_series";
import { Prettify } from "../utility";
import { WithLanguagePage, WithParams } from "./common";

/**
 * Almost every query within the TV Series domain
 * will take this required param to identify the
 * tv show.
 */
type TVBaseParam = { series_id: number };

/**
 * Parameters for TV series list endpoints (popular, top rated, airing today, on the air).
 */
export type TVSeriesListParams = Prettify<WithLanguagePage & { timezone?: Timezone }>;

/**
 * Parameters for fetching TV show details with optional additional data appended.
 */
export type TVDetailsParams = Prettify<TVBaseParam & { append_to_response?: TVAppendToResponseNamespace[] } & WithParams<"language">>;

/**
 * Parameters for fetching aggregate credits for a TV show (cast and crew across all seasons).
 */
export type TVAggregateCreditsParams = Prettify<TVBaseParam & WithParams<"language">>;
