/// <reference types="node" />
import { describe, expect, it } from "vitest";
import { TMDB } from "../../tmdb";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your environment variables.");

const tmdb = new TMDB(token, { language: "en-US" });

describe("PeopleListsAPI (integration)", () => {
	it("(POPULAR) should return a paginated list of popular people", async () => {
		const result = await tmdb.people_lists.popular();
		expect(result.page).toBe(1);
		expect(result.total_results).toBeGreaterThan(0);
		expect(result.results.length).toBeGreaterThan(0);
		expect(result.results[0]).toHaveProperty("id");
		expect(result.results[0]).toHaveProperty("name");
	});

	it("(POPULAR) should support pagination", async () => {
		const page2 = await tmdb.people_lists.popular({ page: 2 });
		expect(page2.page).toBe(2);
		expect(page2.results.length).toBeGreaterThan(0);
	});

	it("(POPULAR) should support language param", async () => {
		const result = await tmdb.people_lists.popular({ language: "fr-FR" });
		expect(result.results.length).toBeGreaterThan(0);
	});
});
