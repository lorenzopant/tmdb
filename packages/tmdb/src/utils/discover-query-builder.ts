import { WatchMonetizationType } from "../types/common";
import { CountryISO3166_1, Language, LanguageISO6391 } from "../types/config";
import { DiscoverMovieParams, DiscoverMovieSortBy, DiscoverTVParams, DiscoverTVSortBy } from "../types/discover";
import { DiscoverTVStatus, DiscoverTVType, MovieReleaseType } from "../types/enums";
import { and, DiscoverDateRange, DiscoverRange, or } from "./discover-filters";

function joinByMode(mode: "and" | "or", values: (string | number)[]): string {
	return mode === "or" ? or(...values) : and(...values);
}

abstract class DiscoverQueryBuilderBase<TParams extends Record<string, unknown>, TSortBy extends string> {
	protected params: Record<string, unknown> = {};

	protected set(key: string, value: unknown): this {
		if (value !== undefined) this.params[key] = value;
		return this;
	}

	protected applyRange(range: { gte?: number | string; lte?: number | string }, gteKey: string, lteKey: string): this {
		this.set(gteKey, range.gte);
		this.set(lteKey, range.lte);
		return this;
	}

	/** Filters to genres matching all (`"and"`) or any (`"or"`) of the given IDs (`with_genres`). */
	withGenres(mode: "and" | "or", ...ids: number[]): this {
		return this.set("with_genres", joinByMode(mode, ids));
	}

	/** Excludes results matching any of the given genre IDs (`without_genres`, AND-only on TMDB). */
	withoutGenres(...ids: number[]): this {
		return this.set("without_genres", and(...ids));
	}

	/** Filters to keywords matching all (`"and"`) or any (`"or"`) of the given IDs (`with_keywords`). */
	withKeywords(mode: "and" | "or", ...ids: number[]): this {
		return this.set("with_keywords", joinByMode(mode, ids));
	}

	/** Excludes results matching any of the given keyword IDs (`without_keywords`, AND-only on TMDB). */
	withoutKeywords(...ids: number[]): this {
		return this.set("without_keywords", and(...ids));
	}

	/** Filters to production companies matching all (`"and"`) or any (`"or"`) of the given IDs (`with_companies`). */
	withCompanies(mode: "and" | "or", ...ids: number[]): this {
		return this.set("with_companies", joinByMode(mode, ids));
	}

	/** Excludes results matching any of the given production company IDs (`without_companies`, AND-only on TMDB). */
	withoutCompanies(...ids: number[]): this {
		return this.set("without_companies", and(...ids));
	}

	/** Filters to watch providers matching all (`"and"`) or any (`"or"`) of the given IDs (`with_watch_providers`). */
	withWatchProviders(mode: "and" | "or", ...ids: number[]): this {
		return this.set("with_watch_providers", joinByMode(mode, ids));
	}

	/** Excludes results matching any of the given watch provider IDs (`without_watch_providers`, AND-only on TMDB). */
	withoutWatchProviders(...ids: number[]): this {
		return this.set("without_watch_providers", and(...ids));
	}

	/** Sets the watch provider region (`watch_region`) used to resolve `with_watch_providers`/`without_watch_providers`. */
	watchRegion(region: CountryISO3166_1): this {
		return this.set("watch_region", region);
	}

	/** Filters to a production/origin country (`with_origin_country`). */
	withOriginCountry(country: CountryISO3166_1): this {
		return this.set("with_origin_country", country);
	}

	/** Filters to an original language (`with_original_language`). */
	withOriginalLanguage(language: LanguageISO6391): this {
		return this.set("with_original_language", language);
	}

	/** Filters to watch monetization types matching all (`"and"`) or any (`"or"`) of the given values (`with_watch_monetization_types`). */
	withWatchMonetizationTypes(mode: "and" | "or", ...types: WatchMonetizationType[]): this {
		return this.set("with_watch_monetization_types", joinByMode(mode, types));
	}

	/** Sets the vote average bounds (`vote_average.gte`/`vote_average.lte`). */
	voteAverage(range: DiscoverRange): this {
		return this.applyRange(range, "vote_average.gte", "vote_average.lte");
	}

	/** Sets the vote count bounds (`vote_count.gte`/`vote_count.lte`). */
	voteCount(range: DiscoverRange): this {
		return this.applyRange(range, "vote_count.gte", "vote_count.lte");
	}

	/** Sets the sort order (`sort_by`). */
	sortBy(value: TSortBy): this {
		return this.set("sort_by", value);
	}

	/** Sets the results page (`page`). */
	page(value: number): this {
		return this.set("page", value);
	}

	/** Sets the response language (`language`). */
	language(value: Language): this {
		return this.set("language", value);
	}

	/** Includes adult content in the results (`include_adult`). */
	includeAdult(value: boolean): this {
		return this.set("include_adult", value);
	}

	/** Returns a shallow copy of the accumulated discover params. */
	build(): TParams {
		return { ...this.params } as TParams;
	}
}

/**
 * Fluent helper for building {@link DiscoverMovieParams}. Chain filters, then call
 * {@link DiscoverMovieQueryBuilder.build} and pass the result to `tmdb.discover.movie()`.
 *
 * Thin sugar over the standalone `and`/`or`/range functions in `discover-filters.ts` — use
 * those directly instead when params are constructed dynamically (e.g. from a generic key/value
 * mapper) rather than a fixed call chain.
 *
 * @example
 * ```ts
 * const params = new DiscoverMovieQueryBuilder()
 *   .withGenres("or", 28, 12)
 *   .voteAverage({ gte: 6 })
 *   .sortBy("popularity.desc")
 *   .build();
 *
 * const results = await tmdb.discover.movie(params);
 * ```
 */
export class DiscoverMovieQueryBuilder extends DiscoverQueryBuilderBase<DiscoverMovieParams, DiscoverMovieSortBy> {
	/** Sets the runtime bounds in minutes (`with_runtime.gte`/`with_runtime.lte`). */
	runtime(range: DiscoverRange): this {
		return this.applyRange(range, "with_runtime.gte", "with_runtime.lte");
	}

	/** Sets the primary release date bounds (`primary_release_date.gte`/`primary_release_date.lte`). */
	primaryReleaseDate(range: DiscoverDateRange): this {
		return this.applyRange(range, "primary_release_date.gte", "primary_release_date.lte");
	}

	/** Sets the release date bounds (`release_date.gte`/`release_date.lte`). */
	releaseDate(range: DiscoverDateRange): this {
		return this.applyRange(range, "release_date.gte", "release_date.lte");
	}

	/** Sets the certification bounds (`certification.gte`/`certification.lte`). */
	certification(range: { gte?: string; lte?: string }): this {
		return this.applyRange(range, "certification.gte", "certification.lte");
	}

	/** Sets the certification country used to interpret `certification` (`certification_country`). */
	certificationCountry(country: CountryISO3166_1): this {
		return this.set("certification_country", country);
	}

	/** Filters by release region (`region`). */
	region(region: CountryISO3166_1): this {
		return this.set("region", region);
	}

	/** Filters to a release year (`year`). */
	year(value: number): this {
		return this.set("year", value);
	}

	/** Filters to a primary release year (`primary_release_year`). */
	primaryReleaseYear(value: number): this {
		return this.set("primary_release_year", value);
	}

	/** Filters to release types matching all (`"and"`) or any (`"or"`) of the given values (`with_release_type`). */
	withReleaseType(mode: "and" | "or", ...types: MovieReleaseType[]): this {
		return this.set("with_release_type", joinByMode(mode, types));
	}

	/** Includes videos (e.g. trailers) alongside results (`include_video`). */
	includeVideo(value: boolean): this {
		return this.set("include_video", value);
	}
}

/**
 * Fluent helper for building {@link DiscoverTVParams}. Chain filters, then call
 * {@link DiscoverTVQueryBuilder.build} and pass the result to `tmdb.discover.tv()`.
 *
 * Thin sugar over the standalone `and`/`or`/range functions in `discover-filters.ts` — use
 * those directly instead when params are constructed dynamically (e.g. from a generic key/value
 * mapper) rather than a fixed call chain.
 *
 * @example
 * ```ts
 * const params = new DiscoverTVQueryBuilder()
 *   .withNetworks("or", 213)
 *   .voteAverage({ gte: 7 })
 *   .sortBy("popularity.desc")
 *   .build();
 *
 * const results = await tmdb.discover.tv(params);
 * ```
 */
export class DiscoverTVQueryBuilder extends DiscoverQueryBuilderBase<DiscoverTVParams, DiscoverTVSortBy> {
	/** Sets the air date bounds (`air_date.gte`/`air_date.lte`). */
	airDate(range: DiscoverDateRange): this {
		return this.applyRange(range, "air_date.gte", "air_date.lte");
	}

	/** Sets the first air date bounds (`first_air_date.gte`/`first_air_date.lte`). */
	firstAirDate(range: DiscoverDateRange): this {
		return this.applyRange(range, "first_air_date.gte", "first_air_date.lte");
	}

	/** Filters to a first air date year (`first_air_date_year`). */
	firstAirDateYear(value: number): this {
		return this.set("first_air_date_year", value);
	}

	/** Includes results with no first air date set (`include_null_first_air_dates`). */
	includeNullFirstAirDates(value: boolean): this {
		return this.set("include_null_first_air_dates", value);
	}

	/** Filters to results screened theatrically (`screened_theatrically`). */
	screenedTheatrically(value: boolean): this {
		return this.set("screened_theatrically", value);
	}

	/** Sets the timezone used to resolve air dates (`timezone`). */
	timezone(value: string): this {
		return this.set("timezone", value);
	}

	/** Filters to networks matching all (`"and"`) or any (`"or"`) of the given IDs (`with_networks`). */
	withNetworks(mode: "and" | "or", ...ids: number[]): this {
		return this.set("with_networks", joinByMode(mode, ids));
	}

	/** Filters to statuses matching all (`"and"`) or any (`"or"`) of the given values (`with_status`). */
	withStatus(mode: "and" | "or", ...statuses: DiscoverTVStatus[]): this {
		return this.set("with_status", joinByMode(mode, statuses));
	}

	/** Filters to types matching all (`"and"`) or any (`"or"`) of the given values (`with_type`). */
	withType(mode: "and" | "or", ...types: DiscoverTVType[]): this {
		return this.set("with_type", joinByMode(mode, types));
	}
}
