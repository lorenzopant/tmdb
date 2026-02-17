import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "it-IT", region: "IT", timezone: "Europe/Rome" });

describe("TV Series (integration)", () => {
	it("(DETAILS) should get details about a tv show", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1396, append_to_response: ["credits", "external_ids"] });
		expect(show.name).toBe("Breaking Bad");
		expect(show.in_production).toBe(false);
		expect(show.next_episode_to_air).toBe(undefined);
		expect(show.external_ids).toBeDefined();
		expect(show.credits.cast.length).toBeGreaterThan(0);
	});

	it("(AGGREGATE CREDITS) should get aggregate credits a tv show", async () => {
		const show = await tmdb.tv_series.aggregate_credits({ series_id: 1396, language: "es-ES" });
		expect(show.id).toBe(1396);
		expect(Array.isArray(show.cast)).toBe(true);
		expect(Array.isArray(show.crew)).toBe(true);
		expect(show.cast[0].name).toBe("Bryan Cranston");
	});
});
