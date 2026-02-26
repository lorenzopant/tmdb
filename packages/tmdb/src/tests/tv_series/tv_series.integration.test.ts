/// <reference types="node" />
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

	it("(ALTERNATIVE TITLES) should get alternative titles for a tv show", async () => {
		const show = await tmdb.tv_series.alternative_titles({ series_id: 1396 });
		expect(show.id).toBe(1396);
		expect(Array.isArray(show.results)).toBe(true);
		expect(show.results[1].title).toBe("Breaking Bad: A Química do Mal");
	});

	it("(CHANGES) should get changes for a tv show", async () => {
		const show = await tmdb.tv_series.changes({ series_id: 1396 });
		expect(Array.isArray(show.changes)).toBe(true);
	});

	it("(CONTENT RATINGS) should get content ratings for a tv show", async () => {
		const show = await tmdb.tv_series.content_ratings({ series_id: 1396 });
		expect(Array.isArray(show.results)).toBe(true);
		expect(show.results[0].iso_3166_1).toBe("DE");
		expect(show.results[0].rating).toBe("16");
	});

	it("(CREDITS) should get credits for a tv show", async () => {
		const show = await tmdb.tv_series.credits({ series_id: 1396 });
		expect(Array.isArray(show.cast)).toBe(true);
		expect(show.cast[0].name).toBe("Bryan Cranston");
	});

	it("(EPISODE GROUPS) should get episode groups for a tv show", async () => {
		const show = await tmdb.tv_series.episode_groups({ series_id: 1399 });
		expect(Array.isArray(show.results)).toBe(true);
		expect(show.results[0].episode_count).toBe(102);
		expect(show.results[0].network.name).toBe("HBO");
	});

	it("(EXTERNAL IDS) should get external ids for a tv show", async () => {
		const show = await tmdb.tv_series.external_ids({ series_id: 1399 });
		expect(show.imdb_id).toBe("tt0944947");
		expect(show.tvdb_id).toBe(121361);
		expect(show.instagram_id).toBe("gameofthrones");
	});

	it("(IMAGES) should get images for a tv show", async () => {
		const show = await tmdb.tv_series.images({ series_id: 1399 });
		expect(Array.isArray(show.backdrops)).toBe(true);
		expect(Array.isArray(show.posters)).toBe(true);
	});

	it("(IMAGES LANGUAGE) should get images for a tv show including specified language", async () => {
		const show = await tmdb.tv_series.images({ series_id: 1399, include_image_language: "es-ES" });
		expect(Array.isArray(show.backdrops)).toBe(true);
		expect(Array.isArray(show.posters)).toBe(true);
		expect(show.backdrops[0].iso_639_1).toBe("es");
	});

	it("(KEYWORDS) should get keywords for a tv show", async () => {
		const show = await tmdb.tv_series.keywords({ series_id: 1399 });
		expect(Array.isArray(show.results)).toBe(true);
		expect(show.results.map((k) => k.name).includes("kingdom")).toBe(true);
	});

	it("(LATEST) should get latest tv show", async () => {
		const show = await tmdb.tv_series.latest();
		expect(show.id).toBeDefined();
	});

	it("(LISTS) should get tv show lists", async () => {
		const show = await tmdb.tv_series.lists({ series_id: 1399 });
		expect(Array.isArray(show.results)).toBe(true);
		expect(show.results[0].item_count).toBeGreaterThan(0);
		expect(show.results[0].iso_3166_1).toBe("IT");
	});

	it("(RECOMMENDATIONS) should get tv show recommendations", async () => {
		const show = await tmdb.tv_series.recommendations({ series_id: 1399 });
		expect(Array.isArray(show.results)).toBe(true);
		expect(show.results[0].id).toBe(1396); // Breaking Bad recommended first for Game of Thrones;
	});

	it("(REVIEWS) should get tv show reviews", async () => {
		const show = await tmdb.tv_series.reviews({ series_id: 1399, language: "en-US" });
		expect(Array.isArray(show.results)).toBe(true);
		expect(show.results[0].id).toBe("58aa82f09251416f92006a3a");
	});

	it("(SCREENED THEATRICALLY) should get tv episodes screened thetrically", async () => {
		const show = await tmdb.tv_series.screened_theatrically({ series_id: 1399 });
		expect(Array.isArray(show.results)).toBe(true);
		expect(show.id).toBe(1399);
	});

	it("(SIMILAR) should get similar tv shows", async () => {
		const show = await tmdb.tv_series.similar({ series_id: 1399 });
		expect(Array.isArray(show.results)).toBe(true);
	});

	it("(TRANSLATIONS) should get tv shows translations", async () => {
		const show = await tmdb.tv_series.translations({ series_id: 1399 });
		expect(Array.isArray(show.translations)).toBe(true);
		expect(show.translations[0].iso_3166_1).toBe("US");
		expect(show.translations[1].data.tagline).toBe("Das Lied von Eis und Feuer");
	});

	it("(VIDEOS) should get tv shows videos", async () => {
		const show = await tmdb.tv_series.videos({ series_id: 1399 });
		expect(Array.isArray(show.results)).toBe(true);
		expect(show.results[0].site).toBe("YouTube");
		expect(show.results[0].official).toBe(true);
	});

	it("(WATCH PROVIDERS) should get tv shows watch providers", async () => {
		const show = await tmdb.tv_series.watch_providers({ series_id: 1399 });
		expect(show.results).toBeDefined();
		expect(show.results["AE"].flatrate).toBeDefined();
		expect(show.results["AE"].link).toBeDefined();
	});
});
