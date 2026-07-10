// src/drift/key-tree.test.ts

import { describe, expect, it } from "vitest";

import { keyTree } from "./key-tree";

describe("keyTree (unit)", () => {
	it("is value-blind: editing values does not change the output", () => {
		const before = { title: "Fight Club", runtime: 139, vote: { average: 8.4 } };
		const after = { title: "Fight Club (Special Edition)", runtime: 140, vote: { average: 9.1 } };

		expect(keyTree(before)).toEqual(keyTree(after));
	});

	it("surfaces a newly added property path", () => {
		const before = { id: 550, title: "Fight Club" };
		const after = { id: 550, title: "Fight Club", softcore: false };

		const beforePaths = keyTree(before);
		const afterPaths = keyTree(after);

		expect(afterPaths).not.toEqual(beforePaths);
		expect(afterPaths).toContain("softcore");
		expect(beforePaths).not.toContain("softcore");
	});

	it("unions keys across heterogeneous array elements", () => {
		const value = {
			results: [
				{ id: 1, name: "a" },
				{ id: 2, name: "b", extra: true },
			],
		};

		expect(keyTree(value)).toEqual(["results", "results[].extra", "results[].id", "results[].name"]);
	});

	it("still emits a key whose value is null", () => {
		const value = { id: 1, homepage: null };

		expect(keyTree(value)).toEqual(["homepage", "id"]);
	});

	it("returns a sorted, de-duplicated array", () => {
		const value = { b: 1, a: { z: 1, y: [{ k: 1 }, { k: 2 }] } };

		expect(keyTree(value)).toEqual(["a", "a.y", "a.y[].k", "a.z", "b"]);
	});

	it("recurses into nested objects and builds dot-joined paths", () => {
		const value = { belongs_to_collection: { id: 1, name: "x", parts: [{ id: 2 }] } };

		expect(keyTree(value)).toEqual([
			"belongs_to_collection",
			"belongs_to_collection.id",
			"belongs_to_collection.name",
			"belongs_to_collection.parts",
			"belongs_to_collection.parts[].id",
		]);
	});

	it("collapses sibling country-code dictionary keys to a single {} segment", () => {
		const value = {
			results: {
				US: { link: "a", buy: [{ provider_id: 1 }] },
				GB: { link: "b", buy: [{ provider_id: 2 }] },
			},
		};

		expect(keyTree(value)).toEqual([
			"results",
			"results.{}",
			"results.{}.buy",
			"results.{}.buy[].provider_id",
			"results.{}.link",
		]);
	});

	it("is value-blind to a NEW country code (the core false-positive fix)", () => {
		const before = {
			results: {
				US: { link: "a" },
				GB: { link: "b" },
			},
		};
		const after = {
			results: {
				US: { link: "a" },
				GB: { link: "b" },
				DE: { link: "c" }, // JustWatch added a new country — must NOT count as drift
			},
		};

		expect(keyTree(after)).toEqual(keyTree(before));
	});

	it("keeps static keys literal while folding only the dynamic siblings in a mixed object", () => {
		const value = {
			provider_name: "Netflix", // static schema key
			display_priority: 1, // static schema key
			display_priorities: {
				// dict keyed by country code — dynamic
				US: 1,
				GB: 2,
			},
			123: { title: "x" }, // numeric-id dynamic key
		};

		expect(keyTree(value)).toEqual([
			"display_priorities",
			"display_priorities.{}",
			"display_priority",
			"provider_name",
			"{}",
			"{}.title",
		]);
	});

	it("collapses a numeric-id-keyed dictionary", () => {
		const value = {
			"550": { title: "a", genres: [{ id: 1 }] },
			"27205": { title: "b", genres: [{ id: 2 }] },
		};

		expect(keyTree(value)).toEqual(["{}", "{}.genres", "{}.genres[].id", "{}.title"]);
	});

	it("collapses region-subdivision dictionary keys (e.g. CA-QC) alongside plain country codes", () => {
		const value = {
			certifications: {
				US: [{ certification: "R", order: 1 }],
				"CA-QC": [{ certification: "13+", order: 2 }],
			},
		};

		expect(keyTree(value)).toEqual([
			"certifications",
			"certifications.{}",
			"certifications.{}[].certification",
			"certifications.{}[].order",
		]);
	});
});
