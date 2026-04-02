import { describe, expect, it } from "vitest";

import { hasBackdropPath, hasLogoPath, hasPosterPath, hasProfilePath, hasStillPath, isRecord } from "../../utils/types";

describe("isRecord", () => {
	it("returns true for plain objects", () => {
		expect(isRecord({})).toBe(true);
		expect(isRecord({ id: 1, name: "movie" })).toBe(true);
	});

	it("returns true for object-like instances", () => {
		expect(isRecord(new Date())).toBe(true);
	});

	it("returns false for null, arrays and primitives", () => {
		expect(isRecord(null)).toBe(false);
		expect(isRecord([1, 2, 3])).toBe(false);
		expect(isRecord("hello")).toBe(false);
		expect(isRecord(123)).toBe(false);
		expect(isRecord(false)).toBe(false);
		expect(isRecord(undefined)).toBe(false);
	});
});

describe("image path type guards", () => {
	it("hasPosterPath returns true only for string poster_path", () => {
		expect(hasPosterPath({ poster_path: "/poster.jpg" })).toBe(true);
		expect(hasPosterPath({ poster_path: 1 })).toBe(false);
		expect(hasPosterPath({})).toBe(false);
		expect(hasPosterPath(null)).toBe(false);
		expect(hasPosterPath("not-an-object")).toBe(false);
	});

	it("hasBackdropPath returns true only for string backdrop_path", () => {
		expect(hasBackdropPath({ backdrop_path: "/backdrop.jpg" })).toBe(true);
		expect(hasBackdropPath({ backdrop_path: 1 })).toBe(false);
		expect(hasBackdropPath({})).toBe(false);
		expect(hasBackdropPath(undefined)).toBe(false);
	});

	it("hasProfilePath returns true only for string profile_path", () => {
		expect(hasProfilePath({ profile_path: "/profile.jpg" })).toBe(true);
		expect(hasProfilePath({ profile_path: false })).toBe(false);
		expect(hasProfilePath({})).toBe(false);
		expect(hasProfilePath(42)).toBe(false);
	});

	it("hasStillPath returns true only for string still_path", () => {
		expect(hasStillPath({ still_path: "/still.jpg" })).toBe(true);
		expect(hasStillPath({ still_path: null })).toBe(false);
		expect(hasStillPath({})).toBe(false);
		expect(hasStillPath([])).toBe(false);
	});

	it("hasLogoPath returns true only for string logo_path", () => {
		expect(hasLogoPath({ logo_path: "/logo.png" })).toBe(true);
		expect(hasLogoPath({ logo_path: { value: "/logo.png" } })).toBe(false);
		expect(hasLogoPath({})).toBe(false);
		expect(hasLogoPath(Symbol("x") as unknown)).toBe(false);
	});

	it("returns false when a matching key exists on the prototype but is not a string", () => {
		const inherited = Object.create({ poster_path: 10 });
		expect(hasPosterPath(inherited)).toBe(false);
	});
});
