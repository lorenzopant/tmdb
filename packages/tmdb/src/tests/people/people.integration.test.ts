/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your environment variables.");

const tmdb = new TMDB(token, { language: "en-US", region: "US" });
const personId = 31;

describe("PeopleAPI (integration)", () => {
	it("(DETAILS) should fetch person details", async () => {
		const person = await tmdb.people.details({ person_id: personId });
		expect(person.id).toBe(personId);
		expect(typeof person.name).toBe("string");
		expect(person.name.length).toBeGreaterThan(0);
	});

	it("(DETAILS + appends) should include appended subresources", async () => {
		const person = await tmdb.people.details({
			person_id: personId,
			append_to_response: ["images", "external_ids", "movie_credits"],
		});
		expect(person.images).toBeDefined();
		expect(Array.isArray(person.images.profiles)).toBe(true);
		expect(person.external_ids).toBeDefined();
		expect(person.movie_credits).toBeDefined();
		expect(Array.isArray(person.movie_credits.cast)).toBe(true);
	});

	it("(CHANGES) should fetch person changes", async () => {
		const changes = await tmdb.people.changes({ person_id: personId });
		expect(Array.isArray(changes.changes)).toBe(true);
	});

	it("(COMBINED CREDITS) should fetch movie and tv credits", async () => {
		const credits = await tmdb.people.combined_credits({ person_id: personId });
		expect(credits.id).toBe(personId);
		expect(Array.isArray(credits.cast)).toBe(true);
		expect(Array.isArray(credits.crew)).toBe(true);
		expect(credits.cast.length + credits.crew.length).toBeGreaterThan(0);
	});

	it("(EXTERNAL IDS) should fetch person external ids", async () => {
		const ids = await tmdb.people.external_ids({ person_id: personId });
		expect(ids.id).toBe(personId);
		expect(typeof ids.imdb_id === "string" || ids.imdb_id === undefined).toBe(true);
	});

	it("(IMAGES) should fetch person profile images", async () => {
		const images = await tmdb.people.images({ person_id: personId });
		expect(images.id).toBe(personId);
		expect(Array.isArray(images.profiles)).toBe(true);
	});

	it("(LATEST) should fetch the latest person record", async () => {
		const latest = await tmdb.people.latest();
		expect(typeof latest.id).toBe("number");
		expect(typeof latest.name).toBe("string");
	});

	it("(MOVIE CREDITS) should fetch movie credits", async () => {
		const credits = await tmdb.people.movie_credits({ person_id: personId });
		expect(credits.id).toBe(personId);
		expect(Array.isArray(credits.cast)).toBe(true);
		expect(Array.isArray(credits.crew)).toBe(true);
	});

	it("(TAGGED IMAGES) should fetch tagged images", async () => {
		const taggedImages = await tmdb.people.tagged_images({ person_id: personId });
		expect(taggedImages.id).toBe(personId);
		expect(typeof taggedImages.page).toBe("number");
		expect(taggedImages.page).toBeGreaterThanOrEqual(0);
		expect(Array.isArray(taggedImages.results)).toBe(true);
	});

	it("(TRANSLATIONS) should fetch person translations", async () => {
		const translations = await tmdb.people.translations({ person_id: personId });
		expect(translations.id).toBe(personId);
		expect(Array.isArray(translations.translations)).toBe(true);
		expect(translations.translations.length).toBeGreaterThan(0);
	});

	it("(TV CREDITS) should fetch tv credits", async () => {
		const credits = await tmdb.people.tv_credits({ person_id: personId });
		expect(credits.id).toBe(personId);
		expect(Array.isArray(credits.cast)).toBe(true);
		expect(Array.isArray(credits.crew)).toBe(true);
	});
});
