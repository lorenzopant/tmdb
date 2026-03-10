/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../tmdb";
import { Errors } from "../errors/messages";

describe("TMDB API Client", () => {
	it("should throw an error if no access token is provided", () => {
		expect(() => new TMDB("")).toThrowError(Errors.NO_ACCESS_TOKEN);
	});

	it("should create an instance of TMDB with a valid access token", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb).toBeInstanceOf(TMDB);
	});

	it("should expose the discover api", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb.discover).toBeDefined();
	});

	it("should expose the find api", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb.find).toBeDefined();
	});

	it("should expose the watch providers api", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb.watch_providers).toBeDefined();
	});

	it("should expose the keywords api", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb.keywords).toBeDefined();
	});

	it("should expose the networks api", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb.networks).toBeDefined();
	});
});
