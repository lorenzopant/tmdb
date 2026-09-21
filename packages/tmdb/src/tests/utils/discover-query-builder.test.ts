import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { DiscoverAPI } from "../../endpoints/discover";
import { DiscoverMovieQueryBuilder, DiscoverTVQueryBuilder } from "../../utils/discover-query-builder";

// ---------------------------------------------------------------------------
// DiscoverMovieQueryBuilder
// ---------------------------------------------------------------------------

describe("DiscoverMovieQueryBuilder", () => {
	it("builds an empty object from a fresh instance", () => {
		expect(new DiscoverMovieQueryBuilder().build()).toEqual({});
	});

	it("accumulates chained filters into one params object", () => {
		const params = new DiscoverMovieQueryBuilder().withGenres("or", 28, 12).voteAverage({ gte: 6 }).sortBy("popularity.desc").build();

		expect(params).toEqual({
			with_genres: "28|12",
			"vote_average.gte": 6,
			sort_by: "popularity.desc",
		});
	});

	it("returns a shallow copy from build() so later chaining doesn't mutate a prior result", () => {
		const builder = new DiscoverMovieQueryBuilder().withGenres("and", 28);
		const first = builder.build();
		(first as Record<string, unknown>).with_genres = "mutated";

		const second = builder.withKeywords("and", 1).build();

		expect(second.with_genres).toBe("28");
	});

	it("joins with_genres with commas for AND and pipes for OR", () => {
		expect(new DiscoverMovieQueryBuilder().withGenres("and", 28, 12).build()).toEqual({ with_genres: "28,12" });
		expect(new DiscoverMovieQueryBuilder().withGenres("or", 28, 12).build()).toEqual({ with_genres: "28|12" });
	});

	it("without_genres accepts no mode and always joins with commas", () => {
		expect(new DiscoverMovieQueryBuilder().withoutGenres(27, 53).build()).toEqual({ without_genres: "27,53" });
	});

	it("withKeywords/withoutKeywords mirror the genres AND/OR + AND-only behavior", () => {
		expect(new DiscoverMovieQueryBuilder().withKeywords("or", 1, 2).build()).toEqual({ with_keywords: "1|2" });
		expect(new DiscoverMovieQueryBuilder().withoutKeywords(3, 4).build()).toEqual({ without_keywords: "3,4" });
	});

	it("withCompanies/withoutCompanies mirror the genres AND/OR + AND-only behavior", () => {
		expect(new DiscoverMovieQueryBuilder().withCompanies("or", 1, 2).build()).toEqual({ with_companies: "1|2" });
		expect(new DiscoverMovieQueryBuilder().withoutCompanies(3, 4).build()).toEqual({ without_companies: "3,4" });
	});

	it("withWatchProviders/withoutWatchProviders mirror the genres AND/OR + AND-only behavior", () => {
		expect(new DiscoverMovieQueryBuilder().withWatchProviders("or", 8, 9).build()).toEqual({ with_watch_providers: "8|9" });
		expect(new DiscoverMovieQueryBuilder().withoutWatchProviders(8).build()).toEqual({ without_watch_providers: "8" });
	});

	it("sets scalar shared fields", () => {
		const params = new DiscoverMovieQueryBuilder()
			.watchRegion("US")
			.withOriginCountry("US")
			.withOriginalLanguage("en")
			.page(2)
			.language("en-US")
			.includeAdult(false)
			.build();

		expect(params).toEqual({
			watch_region: "US",
			with_origin_country: "US",
			with_original_language: "en",
			page: 2,
			language: "en-US",
			include_adult: false,
		});
	});

	it("sets vote count bounds and watch monetization types", () => {
		const params = new DiscoverMovieQueryBuilder().voteCount({ gte: 100 }).withWatchMonetizationTypes("or", "flatrate", "free").build();

		expect(params).toEqual({
			"vote_count.gte": 100,
			with_watch_monetization_types: "flatrate|free",
		});
	});

	it("sets movie-only scalar and range fields", () => {
		const params = new DiscoverMovieQueryBuilder()
			.runtime({ gte: 90, lte: 150 })
			.primaryReleaseDate({ gte: "2020-01-01" })
			.releaseDate({ lte: "2024-12-31" })
			.certification({ lte: "PG-13" })
			.certificationCountry("US")
			.region("US")
			.year(2020)
			.primaryReleaseYear(2020)
			.withReleaseType("or", 2, 3)
			.includeVideo(true)
			.build();

		expect(params).toEqual({
			"with_runtime.gte": 90,
			"with_runtime.lte": 150,
			"primary_release_date.gte": "2020-01-01",
			"release_date.lte": "2024-12-31",
			"certification.lte": "PG-13",
			certification_country: "US",
			region: "US",
			year: 2020,
			primary_release_year: 2020,
			with_release_type: "2|3",
			include_video: true,
		});
	});

	it("feeds build() output straight into DiscoverAPI.movie() unchanged", async () => {
		const clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		const discoverAPI = new DiscoverAPI(clientMock, {});

		const params = new DiscoverMovieQueryBuilder().withGenres("or", 28, 12).voteAverage({ gte: 6 }).build();
		await discoverAPI.movie(params);

		expect(clientMock.request).toHaveBeenCalledWith("/discover/movie", {
			with_genres: "28|12",
			"vote_average.gte": 6,
		});
	});
});

// ---------------------------------------------------------------------------
// DiscoverTVQueryBuilder
// ---------------------------------------------------------------------------

describe("DiscoverTVQueryBuilder", () => {
	let discoverAPI: DiscoverAPI;
	let clientMock: ApiClient;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		discoverAPI = new DiscoverAPI(clientMock, {});
	});

	it("builds an empty object from a fresh instance", () => {
		expect(new DiscoverTVQueryBuilder().build()).toEqual({});
	});

	it("sets tv-only scalar and range fields", () => {
		const params = new DiscoverTVQueryBuilder()
			.airDate({ gte: "2023-01-01" })
			.firstAirDate({ gte: "2023-01-01", lte: "2023-12-31" })
			.firstAirDateYear(2023)
			.includeNullFirstAirDates(true)
			.screenedTheatrically(false)
			.timezone("Europe/Rome")
			.withNetworks("or", 213)
			.withStatus("and", 0)
			.withType("or", 4, 0)
			.build();

		expect(params).toEqual({
			"air_date.gte": "2023-01-01",
			"first_air_date.gte": "2023-01-01",
			"first_air_date.lte": "2023-12-31",
			first_air_date_year: 2023,
			include_null_first_air_dates: true,
			screened_theatrically: false,
			timezone: "Europe/Rome",
			with_networks: "213",
			with_status: "0",
			with_type: "4|0",
		});
	});

	it("feeds build() output straight into DiscoverAPI.tv() unchanged", async () => {
		const params = new DiscoverTVQueryBuilder().withNetworks("or", 213).voteAverage({ gte: 7 }).build();
		await discoverAPI.tv(params);

		expect(clientMock.request).toHaveBeenCalledWith("/discover/tv", {
			with_networks: "213",
			"vote_average.gte": 7,
		});
	});
});
