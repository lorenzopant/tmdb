/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "en-US", region: "US" });

describe("Credits API", () => {
	it("(DETAILS) should fetch credit details from a discovered movie credit", async () => {
		const credits = await tmdb.movies.credits({ movie_id: 550 });
		const creditId = credits.cast[0]?.credit_id ?? credits.crew[0]?.credit_id;

		if (!creditId) {
			throw new Error("Expected movie 550 to have at least one cast or crew credit_id.");
		}

		const credit = await tmdb.credits.details({ credit_id: creditId });

		expect(credit.id).toBe(creditId);
		expect(credit.person).toBeDefined();
		expect(typeof credit.person.name).toBe("string");
		expect(credit.media).toBeDefined();
		expect(["movie", "tv"]).toContain(credit.media_type);
		expect(credit.media.media_type).toBe(credit.media_type);
	});
});
