import { describe, expect, it } from "vitest";
import { TMDB } from "../../tmdb";
import { TMDB_ERRORS } from "../../errors/messages";
import { TMDBAPIErrorResponse, TMDBError } from "../../errors/tmdb";

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

	it("should throw an error of status code 34 for not found movie ID", async () => {
		const invalid_movie_id = -1; // Invalid movie ID
		const tmdb_error = TMDB_ERRORS.get("34");
		const error = new TMDBError(tmdb_error?.message || "Unknown error", tmdb_error?.http_status || 500, 34);
		await expect(tmdb.movies.details(invalid_movie_id)).rejects.toThrowError(error);
	});
});
