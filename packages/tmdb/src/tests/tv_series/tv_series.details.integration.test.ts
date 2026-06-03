import { TMDB } from "../../tmdb";
import { describe, expect, it } from "vitest";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");

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

	it("(DETAILS + append: aggregate_credits) should include aggregate_credits", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1396, append_to_response: ["aggregate_credits"] });
		expect(show.aggregate_credits).toBeDefined();
		expect(Array.isArray(show.aggregate_credits.cast)).toBe(true);
		expect(Array.isArray(show.aggregate_credits.crew)).toBe(true);
		expect(show.aggregate_credits.cast.length).toBeGreaterThan(0);
	});

	it("(DETAILS + append: alternative_titles) should include alternative_titles", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1396, append_to_response: ["alternative_titles"] });
		expect(show.alternative_titles).toBeDefined();
		expect(Array.isArray(show.alternative_titles.results)).toBe(true);
		expect(show.alternative_titles.results.length).toBeGreaterThan(0);
	});

	it("(DETAILS + append: content_ratings) should include content_ratings", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1396, append_to_response: ["content_ratings"] });
		expect(show.content_ratings).toBeDefined();
		expect(Array.isArray(show.content_ratings.results)).toBe(true);
		expect(show.content_ratings.results.length).toBeGreaterThan(0);
	});

	it("(DETAILS + append: episode_groups) should include episode_groups", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1399, append_to_response: ["episode_groups"] });
		expect(show.episode_groups).toBeDefined();
		expect(Array.isArray(show.episode_groups.results)).toBe(true);
		expect(show.episode_groups.results.length).toBeGreaterThan(0);
	});

	it("(DETAILS + append: lists) should include lists", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1399, append_to_response: ["lists"] });
		expect(show.lists).toBeDefined();
		expect(Array.isArray(show.lists.results)).toBe(true);
	});

	it("(DETAILS + append: reviews) should include reviews", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1399, append_to_response: ["reviews"] });
		expect(show.reviews).toBeDefined();
		expect(Array.isArray(show.reviews.results)).toBe(true);
		expect(show.reviews.results.length).toBeGreaterThan(0);
	});

	it("(DETAILS + append: screened_theatrically) should include screened_theatrically", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1399, append_to_response: ["screened_theatrically"] });
		expect(show.screened_theatrically).toBeDefined();
		expect(Array.isArray(show.screened_theatrically.results)).toBe(true);
	});

	it("(DETAILS + append: watch/providers) should include watch_providers", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1399, append_to_response: ["watch/providers"] });
		expect(show["watch/providers"]).toBeDefined();
		expect(show["watch/providers"].results).toBeDefined();
	});
});
