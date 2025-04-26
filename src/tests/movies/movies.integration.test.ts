import { describe, expect, it } from "vitest";
import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token);

describe("Movies (integration)", () => {
	it("should get movie details", async () => {
		const movie_id = 550; // Fight Club
		const movie = await tmdb.movies.details(movie_id);
		expect(movie).toBeDefined();
		expect(movie.id).toBe(movie_id);
		expect(movie.title).toBe("Fight Club");
	});
});
