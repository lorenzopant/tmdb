/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";
import { TVSeasonBaseParams } from "../../types";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your environment variables.");

const tmdb = new TMDB(token);

// Breaking Bad — Series ID 1396, Season 1
const params: TVSeasonBaseParams = {
	series_id: 1396,
	season_number: 1,
};

describe("TV Seasons API", () => {
	it("(DETAILS) should get details about a tv season", async () => {
		const season = await tmdb.tv_seasons.details({ ...params });
		expect(season.name).toBe("Season 1");
		expect(season.season_number).toBe(1);
		expect(Array.isArray(season.episodes)).toBe(true);
		expect(season.episodes.length).toBeGreaterThan(0);
	});

	it("(DETAILS with append_to_response) should get season details with appended data", async () => {
		const season = await tmdb.tv_seasons.details({ ...params, append_to_response: ["credits", "external_ids"] });
		expect(season.name).toBe("Season 1");
		expect(season.credits).toBeDefined();
		expect(season.external_ids).toBeDefined();
	});

	it("(AGGREGATE CREDITS) should get aggregate credits for a tv season", async () => {
		const credits = await tmdb.tv_seasons.aggregate_credits({ ...params });
		expect(credits.id).toBeDefined();
		expect(Array.isArray(credits.cast)).toBe(true);
		expect(Array.isArray(credits.crew)).toBe(true);
		expect(credits.cast[0].name).toBe("Bryan Cranston");
	});

	it("(CHANGES) should get changes for a tv season", async () => {
		// Season 3624 is Breaking Bad Season 1's internal TMDB season_id
		const changes = await tmdb.tv_seasons.changes({ season_id: 3624 });
		expect(changes.changes).toBeDefined();
		expect(Array.isArray(changes.changes)).toBe(true);
	});

	it("(CREDITS) should get credits for a tv season", async () => {
		const credits = await tmdb.tv_seasons.credits({ ...params });
		expect(Array.isArray(credits.cast)).toBe(true);
		expect(Array.isArray(credits.crew)).toBe(true);
		expect(credits.id).toBeDefined();
	});

	it("(EXTERNAL IDS) should get external ids for a tv season", async () => {
		const ids = await tmdb.tv_seasons.external_ids({ ...params });
		expect(ids.tvdb_id).toBeDefined();
	});

	it("(IMAGES) should get images for a tv season", async () => {
		const images = await tmdb.tv_seasons.images({ ...params });
		expect(Array.isArray(images.posters)).toBe(true);
		expect(images.posters.length).toBeGreaterThan(0);
	});

	it("(TRANSLATIONS) should get translations for a tv season", async () => {
		const results = await tmdb.tv_seasons.translations({ ...params });
		expect(Array.isArray(results.translations)).toBe(true);
		expect(results.translations[0].data.name).toBeDefined();
	});

	it("(VIDEOS) should get videos for a tv season", async () => {
		const videos = await tmdb.tv_seasons.videos({ ...params });
		expect(Array.isArray(videos.results)).toBe(true);
	});

	it("(WATCH PROVIDERS) should get watch providers for a tv season", async () => {
		const providers = await tmdb.tv_seasons.watch_providers({ ...params });
		expect(providers.results).toBeDefined();
	});
});
