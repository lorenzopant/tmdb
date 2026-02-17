import { TMDB } from "../../tmdb";
import { describe, expect, it } from "vitest";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "en-US", region: "US", timezone: "Europe/Rome" });

describe("TV Series Details (integration)", () => {
	it("(DETAILS) should fetch top-level details for a TV series", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1396 });
		expect(show.id).toBe(1396);
		expect(typeof show.name).toBe("string");
		expect(show.number_of_seasons).toBeGreaterThan(0);
	});

	it("(DETAILS + appends: credits, external_ids) should include credits and external ids", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1396, append_to_response: ["credits", "external_ids"] });
		expect(show.external_ids).toBeDefined();
		expect(typeof show.external_ids.imdb_id === "string" || show.external_ids.imdb_id === null).toBe(true);
		expect(show.credits).toBeDefined();
		expect(Array.isArray(show.credits.cast)).toBe(true);
		expect(show.credits.cast.length).toBeGreaterThan(0);
	});

	it("(DETAILS + appends: images, videos) should include media collections", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1396, append_to_response: ["images", "videos"] });
		expect(show.images).toBeDefined();
		expect(Array.isArray(show.images.posters)).toBe(true);
		expect(show.videos).toBeDefined();
		expect(Array.isArray(show.videos.results)).toBe(true);
	});

	it("(DETAILS + multiple appends & language) should allow language override and multiple appends", async () => {
		const show = await tmdb.tv_series.details({
			series_id: 1396,
			append_to_response: ["credits", "translations", "videos"],
			language: "es-ES",
		});
		expect(show.credits).toBeDefined();
		expect(show.translations).toBeDefined();
		expect(show.videos).toBeDefined();
	});
});
