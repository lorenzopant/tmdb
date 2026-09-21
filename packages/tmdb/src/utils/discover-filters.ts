import type { DiscoverMovieParams, DiscoverTVParams } from "../types/discover";

/**
 * Joins values into a comma-separated AND expression for TMDB discover filters
 * (e.g. `with_genres`, `with_keywords`) — results must match every value.
 *
 * @param values - The IDs/values to combine with AND semantics.
 * @returns A comma-separated string, e.g. `"28,12"`.
 *
 * @example
 * ```ts
 * and(28, 12); // "28,12"
 * ```
 */
export function and(...values: (string | number)[]): string {
	return values.join(",");
}

/**
 * Joins values into a pipe-separated OR expression for TMDB discover filters
 * (e.g. `with_genres`, `with_keywords`) — results must match any value.
 *
 * @param values - The IDs/values to combine with OR semantics.
 * @returns A pipe-separated string, e.g. `"28|12"`.
 *
 * @example
 * ```ts
 * or(28, 12); // "28|12"
 * ```
 */
export function or(...values: (string | number)[]): string {
	return values.join("|");
}

function withDefinedKeys<T extends object>(entries: T): Partial<T> {
	const result: Partial<T> = {};
	for (const key of Object.keys(entries) as (keyof T)[]) {
		if (entries[key] !== undefined) result[key] = entries[key];
	}
	return result;
}

/** A numeric range with an optional lower (`gte`) and upper (`lte`) bound. */
export type DiscoverRange = { gte?: number; lte?: number };

/** A date range (`YYYY-MM-DD`) with an optional lower (`gte`) and upper (`lte`) bound. */
export type DiscoverDateRange = { gte?: string; lte?: string };

/**
 * Builds the `vote_average.gte`/`vote_average.lte` discover params from a range.
 * Shared by movie and TV discover. Bounds left `undefined` are omitted entirely.
 *
 * @example
 * ```ts
 * voteAverage({ gte: 6 }); // { "vote_average.gte": 6 }
 * ```
 */
export function voteAverage(range: DiscoverRange): Partial<Pick<DiscoverMovieParams, "vote_average.gte" | "vote_average.lte">> {
	return withDefinedKeys({ "vote_average.gte": range.gte, "vote_average.lte": range.lte });
}

/**
 * Builds the `vote_count.gte`/`vote_count.lte` discover params from a range.
 * Shared by movie and TV discover. Bounds left `undefined` are omitted entirely.
 *
 * @example
 * ```ts
 * voteCount({ gte: 100 }); // { "vote_count.gte": 100 }
 * ```
 */
export function voteCount(range: DiscoverRange): Partial<Pick<DiscoverMovieParams, "vote_count.gte" | "vote_count.lte">> {
	return withDefinedKeys({ "vote_count.gte": range.gte, "vote_count.lte": range.lte });
}

/**
 * Builds the `with_runtime.gte`/`with_runtime.lte` discover params from a range.
 * Movie discover only. Bounds left `undefined` are omitted entirely.
 *
 * @example
 * ```ts
 * runtime({ gte: 90, lte: 150 }); // { "with_runtime.gte": 90, "with_runtime.lte": 150 }
 * ```
 */
export function runtime(range: DiscoverRange): Partial<Pick<DiscoverMovieParams, "with_runtime.gte" | "with_runtime.lte">> {
	return withDefinedKeys({ "with_runtime.gte": range.gte, "with_runtime.lte": range.lte });
}

/**
 * Builds the `primary_release_date.gte`/`primary_release_date.lte` discover params from a
 * date range. Movie discover only. Bounds left `undefined` are omitted entirely.
 *
 * @example
 * ```ts
 * primaryReleaseDate({ gte: "2020-01-01" }); // { "primary_release_date.gte": "2020-01-01" }
 * ```
 */
export function primaryReleaseDate(
	range: DiscoverDateRange,
): Partial<Pick<DiscoverMovieParams, "primary_release_date.gte" | "primary_release_date.lte">> {
	return withDefinedKeys({ "primary_release_date.gte": range.gte, "primary_release_date.lte": range.lte });
}

/**
 * Builds the `release_date.gte`/`release_date.lte` discover params from a date range.
 * Movie discover only. Bounds left `undefined` are omitted entirely.
 *
 * @example
 * ```ts
 * releaseDate({ lte: "2024-12-31" }); // { "release_date.lte": "2024-12-31" }
 * ```
 */
export function releaseDate(range: DiscoverDateRange): Partial<Pick<DiscoverMovieParams, "release_date.gte" | "release_date.lte">> {
	return withDefinedKeys({ "release_date.gte": range.gte, "release_date.lte": range.lte });
}

/**
 * Builds the `certification.gte`/`certification.lte` discover params from a range.
 * Movie discover only. Bounds left `undefined` are omitted entirely.
 *
 * @example
 * ```ts
 * certification({ lte: "PG-13" }); // { "certification.lte": "PG-13" }
 * ```
 */
export function certification(range: {
	gte?: string;
	lte?: string;
}): Partial<Pick<DiscoverMovieParams, "certification.gte" | "certification.lte">> {
	return withDefinedKeys({ "certification.gte": range.gte, "certification.lte": range.lte });
}

/**
 * Builds the `air_date.gte`/`air_date.lte` discover params from a date range.
 * TV discover only. Bounds left `undefined` are omitted entirely.
 *
 * @example
 * ```ts
 * airDate({ gte: "2023-01-01" }); // { "air_date.gte": "2023-01-01" }
 * ```
 */
export function airDate(range: DiscoverDateRange): Partial<Pick<DiscoverTVParams, "air_date.gte" | "air_date.lte">> {
	return withDefinedKeys({ "air_date.gte": range.gte, "air_date.lte": range.lte });
}

/**
 * Builds the `first_air_date.gte`/`first_air_date.lte` discover params from a date range.
 * TV discover only. Bounds left `undefined` are omitted entirely.
 *
 * @example
 * ```ts
 * firstAirDate({ gte: "2023-01-01" }); // { "first_air_date.gte": "2023-01-01" }
 * ```
 */
export function firstAirDate(range: DiscoverDateRange): Partial<Pick<DiscoverTVParams, "first_air_date.gte" | "first_air_date.lte">> {
	return withDefinedKeys({ "first_air_date.gte": range.gte, "first_air_date.lte": range.lte });
}
