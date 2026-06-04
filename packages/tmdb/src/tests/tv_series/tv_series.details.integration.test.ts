import { TMDB } from "../../tmdb";
import { beforeAll, describe, expect, it } from "vitest";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token)
	throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "en-US", region: "US", timezone: "Europe/Rome" });

describe("TV Series Details (integration)", () => {
	let show1396: Awaited<
		ReturnType<
			typeof tmdb.tv_series.details<
				["aggregate_credits", "alternative_titles", "content_ratings", "changes"]
			>
		>
	>;
	let show1399: Awaited<
		ReturnType<
			typeof tmdb.tv_series.details<
				["episode_groups", "lists", "reviews", "screened_theatrically", "watch/providers"]
			>
		>
	>;

	beforeAll(async () => {
		[show1396, show1399] = await Promise.all([
			tmdb.tv_series.details({
				series_id: 1396,
				append_to_response: [
					"aggregate_credits",
					"alternative_titles",
					"content_ratings",
					"changes",
				],
			}),
			tmdb.tv_series.details({
				series_id: 1399,
				append_to_response: [
					"episode_groups",
					"lists",
					"reviews",
					"screened_theatrically",
					"watch/providers",
				],
			}),
		]);
	});

	it("(DETAILS) should fetch top-level details for a TV series", async () => {
		const show = await tmdb.tv_series.details({ series_id: 1396 });
		expect(show.id).toBe(1396);
		expect(typeof show.name).toBe("string");
		expect(show.number_of_seasons).toBeGreaterThan(0);
		expect(Array.isArray(show.seasons)).toBe(true);
		expect(typeof show.seasons![0].vote_average).toBe("number");
	});

	it("(DETAILS + appends: credits, external_ids) should include credits and external ids", async () => {
		const show = await tmdb.tv_series.details({
			series_id: 1396,
			append_to_response: ["credits", "external_ids"],
		});
		expect(show.external_ids).toBeDefined();
		expect(
			typeof show.external_ids.imdb_id === "string" || show.external_ids.imdb_id === null,
		).toBe(true);
		expect(show.credits).toBeDefined();
		expect(Array.isArray(show.credits.cast)).toBe(true);
		expect(show.credits.cast.length).toBeGreaterThan(0);
	});

	it("(DETAILS + appends: images, videos) should include media collections", async () => {
		const show = await tmdb.tv_series.details({
			series_id: 1396,
			append_to_response: ["images", "videos"],
		});
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

	it("(DETAILS + append: aggregate_credits) should include aggregate_credits", () => {
		expect(show1396.aggregate_credits).toBeDefined();
		expect(Array.isArray(show1396.aggregate_credits.cast)).toBe(true);
		expect(Array.isArray(show1396.aggregate_credits.crew)).toBe(true);
		expect(show1396.aggregate_credits.cast.length).toBeGreaterThan(0);
	});

	it("(DETAILS + append: alternative_titles) should include alternative_titles", () => {
		expect(show1396.alternative_titles).toBeDefined();
		expect(Array.isArray(show1396.alternative_titles.results)).toBe(true);
		expect(show1396.alternative_titles.results.length).toBeGreaterThan(0);
	});

	it("(DETAILS + append: changes) should include changes", () => {
		expect(show1396.changes).toBeDefined();
		expect(Array.isArray(show1396.changes.changes)).toBe(true);
		expect(show1396.changes.changes.length).toBeGreaterThan(0);
	});

	it("(DETAILS + append: content_ratings) should include content_ratings", () => {
		expect(show1396.content_ratings).toBeDefined();
		expect(Array.isArray(show1396.content_ratings.results)).toBe(true);
		expect(show1396.content_ratings.results.length).toBeGreaterThan(0);
	});

	it("(DETAILS + append: episode_groups) should include episode_groups", () => {
		expect(show1399.episode_groups).toBeDefined();
		expect(Array.isArray(show1399.episode_groups.results)).toBe(true);
		expect(show1399.episode_groups.results.length).toBeGreaterThan(0);
	});

	it("(DETAILS + append: lists) should include lists", () => {
		expect(show1399.lists).toBeDefined();
		expect(Array.isArray(show1399.lists.results)).toBe(true);
	});

	it("(DETAILS + append: reviews) should include reviews", () => {
		expect(show1399.reviews).toBeDefined();
		expect(Array.isArray(show1399.reviews.results)).toBe(true);
		expect(show1399.reviews.results.length).toBeGreaterThan(0);
	});

	it("(DETAILS + append: screened_theatrically) should include screened_theatrically", () => {
		expect(show1399.screened_theatrically).toBeDefined();
		expect(Array.isArray(show1399.screened_theatrically.results)).toBe(true);
	});

	it("(DETAILS + append: watch/providers) should include watch_providers", () => {
		expect(show1399["watch/providers"]).toBeDefined();
		expect(show1399["watch/providers"].results).toBeDefined();
	});
});
