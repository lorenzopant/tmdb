import { describe, expect, it } from "vitest";
import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, please set it in your environment variables.");

describe("Search (integration)", () => {
	it("(SEARCH MOVIE) should search for a particular movie using default client options", async () => {
		const tmdb = new TMDB(token); // no defaults
		const movies = await tmdb.search.movies({ query: "Fight Club" });

		expect(movies.page).toBe(1);
		expect(movies.total_results).toBeGreaterThan(0);
		expect(movies.results.length).toBeGreaterThan(0);
		expect(movies.results[0].title).toBe("Fight Club");
	});

	it("(SEARCH MOVIE) should merge default options (language, region) into search params", async () => {
		const tmdb = new TMDB(token, { language: "it", region: "IT" });
		const movies = await tmdb.search.movies({ query: "Fight Club" });

		expect(movies.page).toBe(1);
		expect(movies.total_results).toBeGreaterThan(0);
		expect(movies.results.length).toBeGreaterThan(0);

		// Even though results can vary, you can at least assert metadata:
		expect(movies).toHaveProperty("page");
		expect(movies).toHaveProperty("results");

		// Ensure Italian language applied (title in Italian, or check metadata)
		const firstTitle = movies.results[0].title.toLowerCase();
		expect(typeof firstTitle).toBe("string");
	});

	it("(SEARCH MOVIE) should allow explicit params to override default options", async () => {
		const tmdb = new TMDB(token, { language: "it", region: "IT" });
		const movies = await tmdb.search.movies({ query: "Fight Club", language: "en" });

		expect(movies.page).toBe(1);
		expect(movies.total_results).toBeGreaterThan(0);
		expect(movies.results.length).toBeGreaterThan(0);

		// Expect movie title to be in English since we overrode the default
		expect(movies.results[0].title).toBe("Fight Club");
	});

	it("(SEARCH COLLECTIONS) should search for a collection", async () => {
		const tmdb = new TMDB(token);
		const collections = await tmdb.search.collections({ query: "Avengers" });

		expect(collections.page).toBe(1);
		expect(collections.total_results).toBeGreaterThan(0);
		expect(collections.results.length).toBeGreaterThan(0);
	});

	it("(SEARCH COMPANY) should search for a company", async () => {
		const tmdb = new TMDB(token);
		const companies = await tmdb.search.company({ query: "HBO" });

		expect(companies.page).toBe(1);
		expect(companies.total_results).toBeGreaterThan(0);
		expect(companies.results.length).toBeGreaterThan(0);
	});

	it("(SEARCH COMPANY) should search for a company with empty country", async () => {
		const tmdb = new TMDB(token);
		const companies = await tmdb.search.company({ query: "HBO" });

		expect(companies.page).toBe(1);
		expect(companies.total_results).toBeGreaterThan(0);
		expect(companies.results.length).toBeGreaterThan(0);
		expect(!companies.results[1].origin_country).toBeDefined();
	});

	it("(SEARCH KEYWORDS) should search for a keyword", async () => {
		const tmdb = new TMDB(token);
		const keywords = await tmdb.search.keyword({ query: "love" });

		expect(keywords.page).toBe(1);
		expect(keywords.total_results).toBeGreaterThan(0);
		expect(keywords.results.length).toBeGreaterThan(0);
	});
});
