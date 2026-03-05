/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "it-IT", region: "IT" });

describe("Changes API", () => {
	it("(MOVIES) should fetch movie changes list", async () => {
		const changes = await tmdb.changes.movie_list();
		expect(changes.results).toBeDefined();
		expect(changes.page).toBe(1);
	});

	it("(MOVIES) should fetch movie changes list with params", async () => {
		const changes = await tmdb.changes.movie_list({ page: 2, start_date: "2026-03-01", end_date: "2026-03-05" });
		expect(changes.results).toBeDefined();
		expect(changes.page).toBeDefined();
	});

	it("(TV) should fetch tv changes list", async () => {
		const changes = await tmdb.changes.tv_list();
		expect(changes.results).toBeDefined();
	});

	it("(PEOPLE) should fetch people changes list", async () => {
		const changes = await tmdb.changes.people_list();
		expect(changes.results).toBeDefined();
	});
});
