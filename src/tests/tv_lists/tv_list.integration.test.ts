import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "it", region: "IT", timezone: "Europe/Rome" });

describe("TV List (integration)", () => {
	it("(AIRING TODAY) should get now airing today tv seres", async () => {
		const airing_today = await tmdb.tv_lists.airing_today();
		expect(airing_today.page).toBe(1);
		expect(airing_today.total_results).toBeGreaterThan(0);
		expect(airing_today.results.length).toBeGreaterThan(0);
	});

	it("(AIRING TODAY) should get now airing today tv seres with specific timezone", async () => {
		const airing_today = await tmdb.tv_lists.airing_today({ timezone: "Pacific/Auckland" });
		expect(airing_today.page).toBe(1);
		expect(airing_today.total_results).toBeGreaterThan(0);
		expect(airing_today.results.length).toBeGreaterThan(0);
	});

	it("(POPULAR) should get popular tv series", async () => {
		const popular = await tmdb.tv_lists.popular();
		expect(popular.page).toBe(1);
		expect(popular.total_results).toBeGreaterThan(0);
		expect(popular.results.length).toBeGreaterThan(0);
	});

	it("(TOP RATED) should get top rated tv series", async () => {
		const top_rated = await tmdb.tv_lists.top_rated();
		expect(top_rated.page).toBe(1);
		expect(top_rated.total_results).toBeGreaterThan(0);
		expect(top_rated.results.length).toBeGreaterThan(0);
	});

	it("(ON THE AIR) should on the air tv series", async () => {
		const on_the_air = await tmdb.tv_lists.on_the_air();
		expect(on_the_air.page).toBe(1);
		expect(on_the_air.total_results).toBeGreaterThan(0);
		expect(on_the_air.results.length).toBeGreaterThan(0);
	});
});
