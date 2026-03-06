/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "es", region: "ES" });

describe("Collections API", () => {
	it("(DETAILS) should fetch collection details", async () => {
		const collection = await tmdb.collections.details({ collection_id: 10 });
		expect(collection.id).toBe(10);
		expect(collection.parts).toBeDefined();
		expect(Array.isArray(collection.parts)).toBe(true);
	});

	it("(DETAILS) should fetch collection details with language", async () => {
		const collection = await tmdb.collections.details({ collection_id: 10, language: "en" });
		expect(collection.id).toBe(10);
		expect(collection.name).toBe("Star Wars Collection");
		expect(collection.parts).toBeDefined();
		expect(Array.isArray(collection.parts)).toBe(true);
	});

	it("(IMAGES) should fetch collection images", async () => {
		const collection = await tmdb.collections.images({ collection_id: 10, language: "en" });
		expect(collection.id).toBe(10);
		expect(collection.posters).toBeDefined();
		expect(collection.backdrops).toBeDefined();
		expect(collection.posters[0].iso_639_1).toBe("en");
	});

	it("(TRANSLATIONS) should fetch collection translations", async () => {
		const collection = await tmdb.collections.translations({ collection_id: 10 });
		expect(collection.id).toBe(10);
		expect(collection.translations).toBeDefined();
		expect(collection.translations[0].iso_3166_1).toBe("SK");
		expect(collection.translations[0].data.title).toBeDefined();
		expect(collection.translations[0].data.overview).toBeFalsy();
	});
});
