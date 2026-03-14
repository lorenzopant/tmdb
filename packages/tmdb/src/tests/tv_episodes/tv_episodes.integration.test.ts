/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";
import { TVEpisodeBaseParams } from "../../types";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token);
const params: TVEpisodeBaseParams = {
	series_id: 1396,
	season_number: 1,
	episode_number: 1,
};

describe("TV Episodes API", () => {
	it("(DETAILS) should get details about a tv episode", async () => {
		const episode = await tmdb.tv_episodes.details({ ...params, append_to_response: ["credits", "external_ids"] });
		expect(episode.name).toBe("Pilot");
		expect(episode.season_number).toBe(1);
		expect(episode.external_ids).toBeDefined();
		expect(episode.credits).toBeDefined();
	});

	it("(CHANGES) should get changes for a tv episode", async () => {
		const episode = await tmdb.tv_episodes.changes({ episode_id: 63056 });
		expect(episode.changes).toBeDefined();
		expect(Array.isArray(episode.changes)).toBe(true);
	});

	it("(CREDITS) should get credits for a tv episode", async () => {
		const credits = await tmdb.tv_episodes.credits({ ...params });
		expect(Array.isArray(credits.crew)).toBe(true);
		expect(Array.isArray(credits.cast)).toBe(true);
		expect(Array.isArray(credits.guest_stars)).toBe(true);
		expect(credits.id).toBe(62085);
	});

	it("(EXTERNAL IDS) should get external ids for a tv episode", async () => {
		const ids = await tmdb.tv_episodes.external_ids({ ...params });
		expect(ids.imdb_id).toBeDefined();
		expect(ids.wikidata_id).toBeDefined();
	});

	it("(IMAGES) should get images for a tv episode", async () => {
		const images = await tmdb.tv_episodes.images({ ...params });
		expect(Array.isArray(images.stills)).toBe(true);
	});

	it("(TRANSLATIONS) should get images for a tv episode", async () => {
		const results = await tmdb.tv_episodes.translations({ ...params });
		expect(Array.isArray(results.translations)).toBe(true);
		expect(results.translations[0].data.name).toBeDefined();
	});

	it("(VIDEOS) should get videos for a tv episode", async () => {
		const videos = await tmdb.tv_episodes.videos({ ...params });
		expect(Array.isArray(videos.results)).toBe(true);
	});
});
