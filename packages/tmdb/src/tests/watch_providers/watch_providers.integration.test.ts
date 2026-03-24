/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";
const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "en-US" });

describe("Watch Providers API", () => {
	it("(MOVIE PROVIDERS) should fetch the movie providers list", async () => {
		const providers = await tmdb.watch_providers.movie_providers();

		expect(Array.isArray(providers.results)).toBe(true);
		expect(providers.results.length).toBeGreaterThan(0);
		expect(providers.results[0].provider_id).toBeDefined();
		expect(providers.results[0].provider_name).toBeDefined();
		expect(providers.results[0].display_priorities).toBeDefined();
	});

	it("(TV PROVIDERS) should fetch the tv providers list", async () => {
		const providers = await tmdb.watch_providers.tv_providers();

		expect(Array.isArray(providers.results)).toBe(true);
		expect(providers.results.length).toBeGreaterThan(0);
		expect(providers.results[0].provider_id).toBeDefined();
		expect(providers.results[0].provider_name).toBeDefined();
		expect(providers.results[0].display_priorities).toBeDefined();
	});

	it("(AVAILABLE REGIONS) should fetch the available regions list", async () => {
		const regions = await tmdb.watch_providers.available_regions();

		expect(Array.isArray(regions.results)).toBe(true);
		expect(regions.results.length).toBeGreaterThan(0);
		expect(regions.results[0].iso_3166_1).toBeDefined();
		expect(regions.results[0].english_name).toBeDefined();
	});
});
