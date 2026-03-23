import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "it-IT", region: "IT" });

describe("Genres API", () => {
	it("should fetch the genres list for movies", async () => {
		const genres = await tmdb.genres.movie_list();
		expect(genres).toHaveProperty("genres");
		expect(genres.genres.length).greaterThan(0);
	});

	it("should fetch genre list for movies with specified language", async () => {
		const genres = await tmdb.genres.movie_list({ language: "it-IT" });
		expect(genres).toHaveProperty("genres");
		expect(genres.genres.length).greaterThan(0);
		const documentario = genres.genres.find((gen) => gen.name === "Documentario");
		expect(documentario).toBeDefined();
	});

	it("should fetch the genres list for tv shows", async () => {
		const genres = await tmdb.genres.tv_list();
		expect(genres).toHaveProperty("genres");
		expect(genres.genres.length).greaterThan(0);
	});

	it("should fetch genre list for movies with specified language", async () => {
		const genres = await tmdb.genres.tv_list({ language: "it-IT" });
		expect(genres).toHaveProperty("genres");
		expect(genres.genres.length).greaterThan(0);
		const famiglia = genres.genres.find((gen) => gen.name === "Famiglia");
		expect(famiglia).toBeDefined();
	});
});
