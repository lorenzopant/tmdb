import { describe, expect, it } from "vitest";
import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token);

describe("Movie List (integration)", () => {
	it("(NOW PLAYING) should get now playing movies", async () => {
		const now_playing = await tmdb.movie_lists.now_playing();
		expect(now_playing.page).toBe(1);
		expect(now_playing.total_results).toBeGreaterThan(0);
		expect(now_playing.results.length).toBeGreaterThan(0);
	});

	it("(POPULAR) should get popular movies", async () => {
		const popular = await tmdb.movie_lists.popular();
		expect(popular.page).toBe(1);
		expect(popular.total_results).toBeGreaterThan(0);
		expect(popular.results.length).toBeGreaterThan(0);
	});

	it("(TOP RATED) should get top rated movies", async () => {
		const top_rated = await tmdb.movie_lists.top_rated();
		expect(top_rated.page).toBe(1);
		expect(top_rated.total_results).toBeGreaterThan(0);
		expect(top_rated.results.length).toBeGreaterThan(0);
	});

	it("(UPCOMING) should get upcoming movies", async () => {
		const upcoming = await tmdb.movie_lists.upcoming();
		expect(upcoming.page).toBe(1);
		expect(upcoming.total_results).toBeGreaterThan(0);
		expect(upcoming.results.length).toBeGreaterThan(0);
	});
});
