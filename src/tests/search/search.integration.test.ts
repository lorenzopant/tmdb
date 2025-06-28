import { describe, expect, it } from "vitest";
import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token);

describe("Search (integration)", () => {
	it("(SEARCH MOVIE) should search for a particular movie", async () => {
		const movies = await tmdb.search.movies({ query: "Fight Club" });
		expect(movies.page).toBe(1);
		expect(movies.total_results).toBeGreaterThan(0);
		expect(movies.results.length).toBeGreaterThan(0);
		expect(movies.results[0].title).toBe("Fight Club");
	});

	it("(SEARCH MOVIE) should search for a movie with default options", async () => {
		const tmdb = new TMDB(token, { language: "it-IT", region: "IT" });
		const movies = await tmdb.search.movies({ query: "Fight Club" });
		expect(movies.page).toBe(1);
		expect(movies.total_results).toBeGreaterThan(0);
		expect(movies.results.length).toBeGreaterThan(0);
		expect(movies.results[0].title).toBe("Fight Club");
	});
});
