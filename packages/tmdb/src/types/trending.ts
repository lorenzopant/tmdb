import type { Language } from "./config/languages";
import type { MovieResultItem, PersonResultItem, TVSeriesResultItem } from "./search";

/** Time window for trending data */
export type TrendingTimeWindow = "day" | "week";

/**
 * Query parameters for all trending endpoints.
 * `time_window` is embedded in the URL path; `language` is a query param.
 */
export type TrendingParams = {
	/** Time window for trending data. `"day"` returns the last 24 hours, `"week"` returns the last 7 days. */
	time_window: TrendingTimeWindow;
	/** Language for localised results (ISO 639-1 + ISO 3166-1, e.g. `"en-US"`). */
	language?: Language;
};

/**
 * A trending movie result.
 * Extends {@link MovieResultItem} with the `media_type` discriminator.
 */
export type TrendingMovieResult = MovieResultItem & {
	/** Media type discriminator — always `"movie"` for this endpoint. */
	media_type: "movie";
};

/**
 * A trending TV series result.
 * Extends {@link TVSeriesResultItem} with the `media_type` discriminator.
 */
export type TrendingTVResult = TVSeriesResultItem & {
	/** Media type discriminator — always `"tv"` for this endpoint. */
	media_type: "tv";
};

/**
 * A trending person result.
 * Extends {@link PersonResultItem} with the `media_type` discriminator.
 */
export type TrendingPersonResult = PersonResultItem & {
	/** Media type discriminator — always `"person"` for this endpoint. */
	media_type: "person";
};

/**
 * Union of all trending result types returned by the `trending.all()` endpoint.
 * Discriminated by `media_type`.
 *
 * @example
 * ```ts
 * import { isTrendingMovie, isTrendingTV } from "@lorenzopant/tmdb";
 *
 * const results = await tmdb.trending.all({ time_window: "day" });
 * for (const item of results.results) {
 *   if (item.media_type === "movie") console.log(item.title);
 *   if (item.media_type === "tv") console.log(item.name);
 *   if (item.media_type === "person") console.log(item.name);
 * }
 * ```
 */
export type TrendingAllResult = TrendingMovieResult | TrendingTVResult | TrendingPersonResult;
