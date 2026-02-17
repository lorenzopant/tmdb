import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "it-IT", region: "IT", timezone: "Europe/Rome" });

describe("TV Series (integration)", () => {
	it("(DETAILS) should get now details about a tv show", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1396, append_to_response: ["credits", "external_ids"] });
		expect(show.name).toBe("Breaking Bad");
		expect(show.in_production).toBe(false);
		expect(show.next_episode_to_air).toBe(undefined);
		expect(show.external_ids).toBeDefined();
		expect(show.credits.cast.length).toBeGreaterThan(0);
	});
});
