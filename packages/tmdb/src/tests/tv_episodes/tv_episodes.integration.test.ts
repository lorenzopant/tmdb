/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";
import { TVEpisodeBaseParams } from "../../types/tv-episodes/params";

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

	// it("(AGGREGATE CREDITS) should get aggregate credits a tv show", async () => {
	// 	const show = await tmdb.tv_series.aggregate_credits({ series_id: 1396, language: "es-ES" });
	// 	expect(show.id).toBe(1396);
	// 	expect(Array.isArray(show.cast)).toBe(true);
	// 	expect(Array.isArray(show.crew)).toBe(true);
	// 	expect(show.cast[0].name).toBe("Bryan Cranston");
	// });
});
