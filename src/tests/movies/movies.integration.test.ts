import { describe, expect, it } from "vitest";
import { TMDB } from "../../tmdb";
import { TMDB_ERRORS } from "../../errors/messages";
import { TMDBAPIErrorResponse, TMDBError } from "../../errors/tmdb";
import { ISO3166Country } from "../../types/utility";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token);

describe("Movies (integration)", () => {
	it("(MOVIE DETAILS) should get movie details", async () => {
		const movie_id = 550; // Fight Club
		const movie = await tmdb.movies.details({ movie_id });
		expect(movie).toBeDefined();
		expect(movie.id).toBe(movie_id);
		expect(movie.title).toBe("Fight Club");
	});

	it("(MOVIE DETAILS) should throw an error for not found movie ID", async () => {
		const invalid_movie_id = -1; // Invalid movie ID

		// ** Can't test the specific error because API is not returning the same error for the same request
		try {
			await tmdb.movies.details({ movie_id: invalid_movie_id });
			throw new Error("Expected TMDBError was not thrown");
		} catch (error) {
			expect(error).toBeInstanceOf(TMDBError);
		}
	});

	it("(MOVIE DETAILS) should get movie details with appended response", async () => {
		const movie_id = 550; // Fight Club
		const movie = await tmdb.movies.details({ movie_id, append_to_response: ["reviews"] });
		expect(movie).toBeDefined();
		expect(movie.id).toBe(movie_id);
		expect(movie.title).toBe("Fight Club");
		expect(movie.reviews.results).toBeDefined();
		expect(movie.reviews.results.length).toBeGreaterThanOrEqual(0);
	});

	it("(MOVIE ALTERNATIVE TITLES) should get movie alternative titles", async () => {
		const movie_id = 550; // Fight Club
		const movie_titles = await tmdb.movies.alternative_titles({ movie_id });
		expect(movie_titles).toBeDefined();
		expect(movie_titles.id).toBe(movie_id);
		expect(movie_titles.titles.length).toBeGreaterThan(0);
	});

	it("(MOVIE CREDITS) should get movie credits", async () => {
		const movie_id = 550; // Fight Club
		const credits = await tmdb.movies.credits({ movie_id });
		expect(credits).toBeDefined();
		expect(credits.id).toBe(movie_id);
		expect(credits.cast.length).toBeGreaterThan(0);
		expect(credits.crew.length).toBeGreaterThan(0);
		expect(credits.cast[0].name).toBe("Edward Norton");
	});

	it("(MOVIE EXTERNAL IDS) should get movie external IDs", async () => {
		const movie_id = 550; // Fight Club
		const external_ids = await tmdb.movies.external_ids({ movie_id });
		expect(external_ids).toBeDefined();
		expect(external_ids.id).toBe(movie_id);
		expect(external_ids.imdb_id).toBe("tt0137523");
	});

	it("(MOVIE KEYWORDS) should get movie keywords", async () => {
		const movie_id = 550; // Fight Club
		const keywords = await tmdb.movies.keywords({ movie_id });
		expect(keywords).toBeDefined();
		expect(keywords.id).toBe(movie_id);
		expect(keywords.keywords.length).toBeGreaterThan(0);
	});

	it("(MOVIE CHANGES) should get movie changes", async () => {
		const movie_id = 550; // Fight Club
		const start_date = "2024-12-20";
		const end_date = "2024-12-24";
		const changes = await tmdb.movies.changes({ movie_id, start_date, end_date });
		expect(changes).toBeDefined();
		expect(changes.changes).toBeDefined();
		expect(changes.changes[0].key).toBe("images");
		expect(changes.changes[0].items.length).toBeGreaterThan(0);
	});

	it("(MOVIE IMAGES) should get movie images", async () => {
		const movie_id = 550; // Fight Club
		const images = await tmdb.movies.images({ movie_id });
		expect(images).toBeDefined();
		expect(images.id).toBe(movie_id);
		expect(images.backdrops.length).toBeGreaterThan(0);
		expect(images.posters.length).toBeGreaterThan(0);
	});

	it("(MOVIE IMAGES) should get movie images for a specific language", async () => {
		const movie_id = 550; // Fight Club
		const images = await tmdb.movies.images({ movie_id, language: "de" });
		expect(images).toBeDefined();
		expect(images.id).toBe(movie_id);
		expect(images.backdrops.length).toBeGreaterThanOrEqual(0);
		expect(images.posters.length).toBeGreaterThan(0);
	});

	it("(MOVIE LATEST) should get the latest movie details", async () => {
		const latestMovie = await tmdb.movies.latest();
		expect(latestMovie).toBeDefined();
		expect(latestMovie.id).toBeDefined();
		expect(latestMovie.title).toBeDefined();
	});

	it("(MOVIE RECOMMENDATIONS) should get movie recommendations", async () => {
		const movie_id = 550; // Fight Club
		const recommendations = await tmdb.movies.recommendations({ movie_id });
		expect(recommendations).toBeDefined();
		expect(recommendations.results.length).toBeGreaterThan(0);
		expect(recommendations.results[0].id).toBeDefined();
		expect(recommendations.page).toBe(1);
		expect(recommendations.total_results).toBeGreaterThan(0);
		expect(recommendations.total_pages).toBeGreaterThan(0);
	});

	it("(MOVIE RELEASE DATES) should get movie release dates", async () => {
		const movie_id = 550; // Fight Club
		const release_dates = await tmdb.movies.release_dates({ movie_id });
		expect(release_dates).toBeDefined();
		expect(release_dates.id).toBe(movie_id);
		expect(release_dates.results.length).toBeGreaterThan(0);
		expect(release_dates.results[0].iso_3166_1).toBeDefined();
		expect(release_dates.results[0].release_dates.length).toBeGreaterThan(0);
	});

	it("(MOVIE REVIEWS) should get movie reviews", async () => {
		const movie_id = 550; // Fight Club
		const reviews = await tmdb.movies.reviews({ movie_id });
		expect(reviews).toBeDefined();
		expect(reviews.results.length).toBeGreaterThan(0);
		expect(reviews.results[0].id).toBeDefined();
		expect(reviews.page).toBe(1);
		expect(reviews.total_results).toBeGreaterThan(0);
		expect(reviews.total_pages).toBeGreaterThan(0);
	});

	it("(MOVIE SIMILAR) should get similar movies", async () => {
		const movie_id = 550;
		const similar = await tmdb.movies.similar({ movie_id });
		expect(similar).toBeDefined();
		expect(similar.results.length).toBeGreaterThan(0);
		expect(similar.results[0].id).toBeDefined();
		expect(similar.page).toBe(1);
		expect(similar.total_results).toBeGreaterThan(0);
		expect(similar.total_pages).toBeGreaterThan(0);
	});

	it("(MOVIE TRANSLATIONS) should get translations for a movie", async () => {
		const movie_id = 550;
		const translations = await tmdb.movies.translations({ movie_id });
		expect(translations).toBeDefined();
		expect(translations.id).toBe(movie_id);
		expect(translations.translations).toBeDefined();
		expect(translations.translations.length).toBeGreaterThan(0);
		expect(translations.translations[0].data).toBeDefined();
	});

	it("(MOVIE VIDEOS) should get videos for a movie", async () => {
		const movie_id = 550;
		const videos = await tmdb.movies.videos({ movie_id });
		expect(videos).toBeDefined();
		expect(videos.id).toBe(movie_id);
		expect(videos.results).toBeDefined();
		expect(videos.results.length).toBeGreaterThan(0);
		expect(videos.results[0].id).toBeDefined();
	});

	it("(MOVIE WATCH PROVIDERS) should get watch providers for a movie", async () => {
		const movie_id = 550;
		const watch_providers = await tmdb.movies.watch_providers({ movie_id });
		expect(watch_providers).toBeDefined();
		expect(watch_providers.id).toBe(movie_id);
		expect(watch_providers.results).toBeDefined();
		expect(watch_providers.results[ISO3166Country.US]).toBeDefined();
	});
});
