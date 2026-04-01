import { describe, expect, it } from "vitest";

import * as utils from "../../utils";
import { hasPosterPath, hasBackdropPath, hasProfilePath, hasStillPath, hasLogoPath } from "../../utils";

describe("utils barrel exports", () => {
	it("re-exports jwt and logger utilities", () => {
		expect(typeof utils.isJwt).toBe("function");
		expect(typeof utils.TMDBLogger).toBe("function");
	});
});

describe("type guards", () => {
	describe("hasPosterPath", () => {
		it("returns true when poster_path is a string", () => {
			expect(hasPosterPath({ poster_path: "/abc.jpg" })).toBe(true);
		});

		it("returns false when poster_path is missing", () => {
			expect(hasPosterPath({ title: "Fight Club" })).toBe(false);
		});

		it("returns false when poster_path is not a string", () => {
			expect(hasPosterPath({ poster_path: null })).toBe(false);
		});

		it("returns false for null", () => {
			expect(hasPosterPath(null)).toBe(false);
		});

		it("returns false for non-object", () => {
			expect(hasPosterPath("string")).toBe(false);
		});
	});

	describe("hasBackdropPath", () => {
		it("returns true when backdrop_path is a string", () => {
			expect(hasBackdropPath({ backdrop_path: "/back.jpg" })).toBe(true);
		});

		it("returns false when backdrop_path is missing", () => {
			expect(hasBackdropPath({ title: "Fight Club" })).toBe(false);
		});

		it("returns false when backdrop_path is not a string", () => {
			expect(hasBackdropPath({ backdrop_path: 0 })).toBe(false);
		});

		it("returns false for null", () => {
			expect(hasBackdropPath(null)).toBe(false);
		});
	});

	describe("hasProfilePath", () => {
		it("returns true when profile_path is a string", () => {
			expect(hasProfilePath({ profile_path: "/person.jpg" })).toBe(true);
		});

		it("returns false when profile_path is missing", () => {
			expect(hasProfilePath({ name: "Brad Pitt" })).toBe(false);
		});

		it("returns false when profile_path is not a string", () => {
			expect(hasProfilePath({ profile_path: true })).toBe(false);
		});

		it("returns false for null", () => {
			expect(hasProfilePath(null)).toBe(false);
		});
	});

	describe("hasStillPath", () => {
		it("returns true when still_path is a string", () => {
			expect(hasStillPath({ still_path: "/still.jpg" })).toBe(true);
		});

		it("returns false when still_path is missing", () => {
			expect(hasStillPath({ name: "Episode 1" })).toBe(false);
		});

		it("returns false when still_path is not a string", () => {
			expect(hasStillPath({ still_path: 42 })).toBe(false);
		});

		it("returns false for null", () => {
			expect(hasStillPath(null)).toBe(false);
		});
	});

	describe("hasLogoPath", () => {
		it("returns true when logo_path is a string", () => {
			expect(hasLogoPath({ logo_path: "/logo.svg" })).toBe(true);
		});

		it("returns false when logo_path is missing", () => {
			expect(hasLogoPath({ name: "Warner Bros" })).toBe(false);
		});

		it("returns false when logo_path is not a string", () => {
			expect(hasLogoPath({ logo_path: [] })).toBe(false);
		});

		it("returns false for null", () => {
			expect(hasLogoPath(null)).toBe(false);
		});
	});
});
