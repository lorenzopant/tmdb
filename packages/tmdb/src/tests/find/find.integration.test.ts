/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "en-US" });

describe("Find API", () => {
	it("(BY ID) should find a movie by IMDb ID", async () => {
		const result = await tmdb.find.by_id({
			external_id: "tt0137523",
			external_source: "imdb_id",
		});

		expect(result.movie_results.length).toBeGreaterThan(0);
		expect(result.movie_results[0].id).toBe(550);
		expect(result.movie_results[0].title).toBe("Fight Club");
		expect(result.movie_results[0].media_type).toBe("movie");
	});

	it("(BY ID) should find a TV series by IMDb ID", async () => {
		const result = await tmdb.find.by_id({
			external_id: "tt0944947",
			external_source: "imdb_id",
		});

		expect(result.tv_results.length).toBeGreaterThan(0);
		expect(result.tv_results[0].id).toBe(1399);
		expect(result.tv_results[0].name).toBe("Game of Thrones");
		expect(result.tv_results[0].media_type).toBe("tv");
	});

	it("(BY ID) should return empty results for an invalid external source/id combination", async () => {
		const result = await tmdb.find.by_id({
			external_id: "tt0137523",
			external_source: "tvdb_id",
		});

		expect(result.movie_results).toEqual([]);
		expect(result.person_results).toEqual([]);
		expect(result.tv_results).toEqual([]);
		expect(result.tv_episode_results).toEqual([]);
		expect(result.tv_season_results).toEqual([]);
	});
});
