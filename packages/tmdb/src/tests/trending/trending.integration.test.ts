import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your environment variables.");

const tmdb = new TMDB(token);

describe("TrendingAPI (integration)", () => {
	// MARK: all()
	describe("all()", () => {
		it("should return a paginated list of trending items for time_window=day", async () => {
			const result = await tmdb.trending.all({ time_window: "day" });
			expect(result).toBeDefined();
			expect(result.page).toBe(1);
			expect(result.results).toBeInstanceOf(Array);
			expect(result.results.length).toBeGreaterThan(0);
			expect(result.total_pages).toBeGreaterThan(0);
			expect(result.total_results).toBeGreaterThan(0);
			// All items should have a media_type
			for (const item of result.results) {
				expect(["movie", "tv", "person"]).toContain(item.media_type);
			}
		});

		it("should return a paginated list of trending items for time_window=week", async () => {
			const result = await tmdb.trending.all({ time_window: "week" });
			expect(result).toBeDefined();
			expect(result.results).toBeInstanceOf(Array);
			expect(result.results.length).toBeGreaterThan(0);
		});
	});

	// MARK: movies()
	describe("movies()", () => {
		it("should return a paginated list of trending movies for time_window=day", async () => {
			const result = await tmdb.trending.movies({ time_window: "day" });
			expect(result).toBeDefined();
			expect(result.page).toBe(1);
			expect(result.results).toBeInstanceOf(Array);
			expect(result.results.length).toBeGreaterThan(0);
			// All items should be movies
			for (const item of result.results) {
				expect(item.media_type).toBe("movie");
				expect(item.id).toBeDefined();
			}
		});

		it("should return a paginated list of trending movies for time_window=week", async () => {
			const result = await tmdb.trending.movies({ time_window: "week" });
			expect(result).toBeDefined();
			expect(result.results).toBeInstanceOf(Array);
			expect(result.results.length).toBeGreaterThan(0);
		});

		it("should return localised results when language is specified", async () => {
			const result = await tmdb.trending.movies({ time_window: "day", language: "it-IT" });
			expect(result).toBeDefined();
			expect(result.results).toBeInstanceOf(Array);
		});
	});

	// MARK: tv()
	describe("tv()", () => {
		it("should return a paginated list of trending TV shows for time_window=day", async () => {
			const result = await tmdb.trending.tv({ time_window: "day" });
			expect(result).toBeDefined();
			expect(result.page).toBe(1);
			expect(result.results).toBeInstanceOf(Array);
			expect(result.results.length).toBeGreaterThan(0);
			// All items should be TV shows
			for (const item of result.results) {
				expect(item.media_type).toBe("tv");
				expect(item.id).toBeDefined();
			}
		});

		it("should return a paginated list of trending TV shows for time_window=week", async () => {
			const result = await tmdb.trending.tv({ time_window: "week" });
			expect(result).toBeDefined();
			expect(result.results).toBeInstanceOf(Array);
			expect(result.results.length).toBeGreaterThan(0);
		});
	});

	// MARK: people()
	describe("people()", () => {
		it("should return a paginated list of trending people for time_window=day", async () => {
			const result = await tmdb.trending.people({ time_window: "day" });
			expect(result).toBeDefined();
			expect(result.page).toBe(1);
			expect(result.results).toBeInstanceOf(Array);
			expect(result.results.length).toBeGreaterThan(0);
			// All items should be people
			for (const item of result.results) {
				expect(item.media_type).toBe("person");
				expect(item.id).toBeDefined();
				expect(item.name).toBeDefined();
			}
		});

		it("should return a paginated list of trending people for time_window=week", async () => {
			const result = await tmdb.trending.people({ time_window: "week" });
			expect(result).toBeDefined();
			expect(result.results).toBeInstanceOf(Array);
			expect(result.results.length).toBeGreaterThan(0);
		});
	});
});
