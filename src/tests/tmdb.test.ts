import { describe, expect, it } from "vitest";
import { TMDB } from "../tmdb";
import { Errors } from "../errors";

describe("TMDB API Client", () => {
	it("should throw an error if no access token is provided", () => {
		expect(() => new TMDB("")).toThrowError(Errors.NO_ACCESS_TOKEN);
	});

	it("should create an instance of TMDB with a valid access token", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb).toBeInstanceOf(TMDB);
	});
});
