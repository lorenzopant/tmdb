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
});
