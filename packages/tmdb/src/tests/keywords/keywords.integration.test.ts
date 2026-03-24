/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "en-US" });
const keywordId = 4379; // "time travel"

describe("Keywords API", () => {
	it("(DETAILS) should fetch keyword details", async () => {
		const keyword = await tmdb.keywords.details({ keyword_id: keywordId });

		expect(keyword.id).toBe(keywordId);
		expect(keyword.name).toBe("time travel");
	});

	it("(MOVIES) should fetch movies for a keyword", async () => {
		const movies = await tmdb.keywords.movies({ keyword_id: keywordId });

		expect(movies.page).toBe(1);
		expect(movies.results.length).toBeGreaterThan(0);
		expect(movies.results.some((movie) => movie.title === "Back to the Future" || movie.title === "Interstellar")).toBe(true);
	});
});
