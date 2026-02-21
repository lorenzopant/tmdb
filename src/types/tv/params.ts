import { Timezone } from "../config/timezones";
import { TVAppendToResponseNamespace } from "../tv/tv_series";
import { Prettify } from "../utility";
import { DateRange, WithLanguagePage, WithParams } from "../common/params";

/**
 * Almost every query within the TV Series domain
 * will take this required param to identify the
 * tv show.
 */
export type TVBaseParam = { series_id: number };

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

/**
 * Parameters for fetching tv show change history.
 */
export type TVChangeParams = Prettify<TVBaseParam & WithParams<"page"> & DateRange>;

/**
 * Parameters for fetching tv show credits (cast and crew last season).
 */
export type TVCreditsParams = Prettify<TVBaseParam & WithParams<"language">>;
