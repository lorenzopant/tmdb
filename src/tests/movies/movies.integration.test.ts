import { describe, expect, it } from "vitest";
import { TMDB } from "../../tmdb";
import { TMDB_ERRORS } from "../../errors/messages";
import { TMDBAPIErrorResponse, TMDBError } from "../../errors/tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token);

describe("Movies (integration)", () => {
	it("(MOVIE DETAILS) should get movie details", async () => {
		const movie_id = 550; // Fight Club
		const movie = await tmdb.movies.details(movie_id);
		expect(movie).toBeDefined();
		expect(movie.id).toBe(movie_id);
		expect(movie.title).toBe("Fight Club");
	});

	it("(MOVIE DETAILS) should throw an error of status code 34 for not found movie ID", async () => {
		const invalid_movie_id = -1; // Invalid movie ID
		const tmdb_error = TMDB_ERRORS.get(34)!;

		try {
			await tmdb.movies.details(invalid_movie_id);
			throw new Error("Expected TMDBError was not thrown");
		} catch (error) {
			expect(error).toBeInstanceOf(TMDBError);
			expect((error as TMDBError).tmdb_status_code).toBe(34);
			expect((error as TMDBError).http_status_code).toBe(tmdb_error.http_status);
			expect((error as TMDBError).message).toBe(tmdb_error.message);
		}
	});

	it("(MOVIE ALTERNATIVE TITLES) should get movie alternative titles", async () => {
		const movie_id = 550; // Fight Club
		const movie_titles = await tmdb.movies.alternative_titles(movie_id);
		expect(movie_titles).toBeDefined();
		expect(movie_titles.id).toBe(movie_id);
		expect(movie_titles.titles.length).toBeGreaterThan(0);
	});

	it("(MOVIE CREDITS) should get movie credits", async () => {
		const movie_id = 550; // Fight Club
		const credits = await tmdb.movies.credits(movie_id);
		expect(credits).toBeDefined();
		expect(credits.id).toBe(movie_id);
		expect(credits.cast.length).toBeGreaterThan(0);
		expect(credits.crew.length).toBeGreaterThan(0);
		expect(credits.cast[0].name).toBe("Edward Norton");
	});

	it("(MOVIE EXTERNAL IDS) should get movie external IDs", async () => {
		const movie_id = 550; // Fight Club
		const external_ids = await tmdb.movies.external_ids(movie_id);
		expect(external_ids).toBeDefined();
		expect(external_ids.id).toBe(movie_id);
		expect(external_ids.imdb_id).toBe("tt0137523");
	});
});
