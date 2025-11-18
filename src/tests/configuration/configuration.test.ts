import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "it", region: "IT" });

describe("Configuration API", () => {
	it("should fetch the configuration successfully", async () => {
		const config = await tmdb.config.get();
		// Check that images object exists
		expect(config).toHaveProperty("images");
		expect(config.images).toHaveProperty("base_url");
		expect(config.images).toHaveProperty("secure_base_url");

		// Check image sizes arrays exist and are non-empty
		expect(Array.isArray(config.images.backdrop_sizes)).toBe(true);
		expect(config.images.backdrop_sizes.length).toBeGreaterThan(0);

		expect(Array.isArray(config.images.logo_sizes)).toBe(true);
		expect(config.images.logo_sizes.length).toBeGreaterThan(0);

		expect(Array.isArray(config.images.poster_sizes)).toBe(true);
		expect(config.images.poster_sizes.length).toBeGreaterThan(0);

		expect(Array.isArray(config.images.profile_sizes)).toBe(true);
		expect(config.images.profile_sizes.length).toBeGreaterThan(0);

		expect(Array.isArray(config.images.still_sizes)).toBe(true);
		expect(config.images.still_sizes.length).toBeGreaterThan(0);

		// Check change_keys exists and is an array
		expect(Array.isArray(config.change_keys)).toBe(true);
	});

	it("(COUNTRIES) should get list of countries used in TMDB", async () => {
		const countries = await tmdb.config.countries();
		expect(countries.length).toBeGreaterThan(1);
		expect(countries[0].iso_3166_1).toBe("AD");
	});

	it("(COUNTRIES) should get list of countries used in TMDB with specifed language", async () => {
		const countries = await tmdb.config.countries({ language: "it" });
		expect(countries.length).toBeGreaterThan(1);
		expect(countries[1]).toBeDefined();
		expect(countries[1].native_name).toBe("Emirati Arabi Uniti");
	});
});
