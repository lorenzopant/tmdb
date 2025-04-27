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

	it("(MOVIE DETAILS) should throw an error for not found movie ID", async () => {
		const invalid_movie_id = -1; // Invalid movie ID

		// ** Can't test the specific error because API is not returning the same error for the same request
		try {
			await tmdb.movies.details(invalid_movie_id);
			throw new Error("Expected TMDBError was not thrown");
		} catch (error) {
			expect(error).toBeInstanceOf(TMDBError);
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

	it("(MOVIE KEYWORDS) should get movie keywords", async () => {
		const movie_id = 550; // Fight Club
		const keywords = await tmdb.movies.keywords(movie_id);
		expect(keywords).toBeDefined();
		expect(keywords.id).toBe(movie_id);
		expect(keywords.keywords.length).toBeGreaterThan(0);
	});

	it("(MOVIE CHANGES) should get movie changes", async () => {
		const movie_id = 550; // Fight Club
		const start_date = "2024-12-20";
		const end_date = "2024-12-24";
		const changes = await tmdb.movies.changes(movie_id, 1, start_date, end_date);
		expect(changes).toBeDefined();
		expect(changes.changes).toBeDefined();
		expect(changes.changes[0].key).toBe("images");
		expect(changes.changes[0].items.length).toBeGreaterThan(0);
	});

	it("(MOVIE IMAGES) should get movie images", async () => {
		const movie_id = 550; // Fight Club
		const images = await tmdb.movies.images(movie_id);
		expect(images).toBeDefined();
		expect(images.id).toBe(movie_id);
		expect(images.backdrops.length).toBeGreaterThan(0);
		expect(images.posters.length).toBeGreaterThan(0);
	});

	it("(MOVIE IMAGES) should get movie images for a specific language", async () => {
		const movie_id = 550; // Fight Club
		const images = await tmdb.movies.images(movie_id, "en");
		expect(images).toBeDefined();
		expect(images.id).toBe(movie_id);
		expect(images.backdrops.length).toBeGreaterThan(0);
		expect(images.posters.length).toBeGreaterThan(0);
	});
});
