import { describe, expect, it } from "vitest";

import { hasBackdropPath, hasLogoPath, hasPosterPath, hasProfilePath, hasStillPath, isPlainObject, isRecord } from "../../utils/types";

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

describe("isPlainObject", () => {
	it("returns true for plain objects and null-prototype objects", () => {
		expect(isPlainObject({})).toBe(true);
		expect(isPlainObject({ id: 1 })).toBe(true);
		expect(isPlainObject(Object.create(null))).toBe(true);
	});

	it("returns false for non-plain object instances and non-objects", () => {
		expect(isPlainObject(new Date())).toBe(false);
		expect(isPlainObject(new Map())).toBe(false);
		expect(isPlainObject([])).toBe(false);
		expect(isPlainObject(null)).toBe(false);
		expect(isPlainObject("hello")).toBe(false);
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

describe("image path type guards — narrowing", () => {
	interface Movie {
		id: number;
		title: string;
		poster_path?: string;
	}

	it("preserves the input type when filtering a typed array", () => {
		const movies: Movie[] = [
			{ id: 1, title: "With poster", poster_path: "/poster.jpg" },
			{ id: 2, title: "Without poster" },
		];

		const withPosters = movies.filter(hasPosterPath);

		// Type-level: `poster_path` is `string` (not `string | undefined`) and the
		// rest of `Movie` survives. Both assignments fail to compile on regression.
		const path: string = withPosters[0]!.poster_path;
		const title: string = withPosters[0]!.title;

		expect(withPosters).toHaveLength(1);
		expect(path).toBe("/poster.jpg");
		expect(title).toBe("With poster");
	});

	it("still narrows an unknown value to the image-path shape", () => {
		const data: unknown = { poster_path: "/poster.jpg" };

		if (!hasPosterPath(data)) throw new Error("expected poster_path");
		const path: string = data.poster_path;

		expect(path).toBe("/poster.jpg");
	});

	it("narrows a typed value without discarding its other properties", () => {
		const movie: Movie = { id: 7, title: "Narrowed", poster_path: "/p.jpg" };

		if (!hasPosterPath(movie)) throw new Error("expected poster_path");
		const path: string = movie.poster_path;

		expect(path).toBe("/p.jpg");
		expect(movie.id).toBe(7);
	});

	it("narrows the remaining image-path guards the same way", () => {
		const raw: unknown[] = [
			{ backdrop_path: "/b.jpg" },
			{ profile_path: "/pr.jpg" },
			{ still_path: "/s.jpg" },
			{ logo_path: "/l.png" },
			{},
		];

		const backdrops: string[] = raw.filter(hasBackdropPath).map((item) => item.backdrop_path);
		const profiles: string[] = raw.filter(hasProfilePath).map((item) => item.profile_path);
		const stills: string[] = raw.filter(hasStillPath).map((item) => item.still_path);
		const logos: string[] = raw.filter(hasLogoPath).map((item) => item.logo_path);

		expect(backdrops).toEqual(["/b.jpg"]);
		expect(profiles).toEqual(["/pr.jpg"]);
		expect(stills).toEqual(["/s.jpg"]);
		expect(logos).toEqual(["/l.png"]);
	});
});
