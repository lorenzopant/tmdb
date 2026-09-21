import { describe, expect, it } from "vitest";

import {
	airDate,
	and,
	certification,
	firstAirDate,
	or,
	primaryReleaseDate,
	releaseDate,
	runtime,
	voteAverage,
	voteCount,
} from "../../utils/discover-filters";

// ---------------------------------------------------------------------------
// and() / or()
// ---------------------------------------------------------------------------

describe("and", () => {
	it("joins multiple values with commas", () => {
		expect(and(28, 12)).toBe("28,12");
	});

	it("returns a single value unchanged", () => {
		expect(and(28)).toBe("28");
	});

	it("returns an empty string for no values", () => {
		expect(and()).toBe("");
	});

	it("accepts mixed string and number values", () => {
		expect(and("US", 28)).toBe("US,28");
	});
});

describe("or", () => {
	it("joins multiple values with pipes", () => {
		expect(or(28, 12)).toBe("28|12");
	});

	it("returns a single value unchanged", () => {
		expect(or(28)).toBe("28");
	});

	it("returns an empty string for no values", () => {
		expect(or()).toBe("");
	});

	it("accepts mixed string and number values", () => {
		expect(or("flatrate", 8)).toBe("flatrate|8");
	});
});

// ---------------------------------------------------------------------------
// Range helpers
// ---------------------------------------------------------------------------

describe("voteAverage", () => {
	it("sets both bounds when both are provided", () => {
		expect(voteAverage({ gte: 5, lte: 8 })).toEqual({ "vote_average.gte": 5, "vote_average.lte": 8 });
	});

	it("omits the upper bound key entirely when lte is undefined", () => {
		const result = voteAverage({ gte: 5 });
		expect(result).toEqual({ "vote_average.gte": 5 });
		expect(result).not.toHaveProperty("vote_average.lte");
	});

	it("returns an empty object when no bounds are provided", () => {
		expect(voteAverage({})).toEqual({});
	});
});

describe("voteCount", () => {
	it("sets both bounds when both are provided", () => {
		expect(voteCount({ gte: 100, lte: 500 })).toEqual({ "vote_count.gte": 100, "vote_count.lte": 500 });
	});

	it("omits the lower bound key entirely when gte is undefined", () => {
		const result = voteCount({ lte: 500 });
		expect(result).toEqual({ "vote_count.lte": 500 });
		expect(result).not.toHaveProperty("vote_count.gte");
	});
});

describe("runtime", () => {
	it("builds with_runtime bounds", () => {
		expect(runtime({ gte: 90, lte: 150 })).toEqual({ "with_runtime.gte": 90, "with_runtime.lte": 150 });
	});
});

describe("primaryReleaseDate", () => {
	it("builds primary_release_date bounds from date strings", () => {
		expect(primaryReleaseDate({ gte: "2020-01-01" })).toEqual({ "primary_release_date.gte": "2020-01-01" });
	});
});

describe("releaseDate", () => {
	it("builds release_date bounds from date strings", () => {
		expect(releaseDate({ lte: "2024-12-31" })).toEqual({ "release_date.lte": "2024-12-31" });
	});
});

describe("certification", () => {
	it("builds certification bounds", () => {
		expect(certification({ gte: "PG", lte: "PG-13" })).toEqual({ "certification.gte": "PG", "certification.lte": "PG-13" });
	});
});

describe("airDate", () => {
	it("builds air_date bounds from date strings", () => {
		expect(airDate({ gte: "2023-01-01" })).toEqual({ "air_date.gte": "2023-01-01" });
	});
});

describe("firstAirDate", () => {
	it("builds first_air_date bounds from date strings", () => {
		expect(firstAirDate({ gte: "2023-01-01", lte: "2023-12-31" })).toEqual({
			"first_air_date.gte": "2023-01-01",
			"first_air_date.lte": "2023-12-31",
		});
	});
});
