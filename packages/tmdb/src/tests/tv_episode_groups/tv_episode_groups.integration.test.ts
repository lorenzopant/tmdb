/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");

const tmdb = new TMDB(token);

describe("TV Episode Groups API", () => {
	it("(DETAILS) should get details for a tv episode group", async () => {
		const details = await tmdb.tv_episode_groups.details({ episode_group_id: "5acf93e60e0a26346d0000ce" });
		expect(details.id).toBe("5acf93e60e0a26346d0000ce");
		expect(details.name).toBeDefined();
		expect(Array.isArray(details.groups)).toBe(true);
		expect(details.groups.length).toBeGreaterThan(0);
		expect(Array.isArray(details.groups[0].episodes)).toBe(true);
		expect(details.groups[0].episodes.length).toBeGreaterThan(0);
	});
});
