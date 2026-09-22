/// <reference types="node" />
import { stripVTControlCharacters } from "node:util";

import { describe, expect, it } from "vitest";

import {
	colorEnabled,
	createStyle,
	formatCount,
	formatDetail,
	formatJson,
	formatRating,
	formatRuntime,
	formatTable,
	formatVotes,
	formatYear,
	plural,
	styleRating,
	truncateText,
	withYear,
	wrapText,
} from "../../cli/output";

describe("colorEnabled()", () => {
	it("follows the TTY by default", () => {
		expect(colorEnabled({}, true)).toBe(true);
		expect(colorEnabled({}, false)).toBe(false);
	});

	it("is disabled by NO_COLOR and TERM=dumb", () => {
		expect(colorEnabled({ NO_COLOR: "1" }, true)).toBe(false);
		expect(colorEnabled({ NO_COLOR: "1", FORCE_COLOR: "1" }, true)).toBe(false);
		expect(colorEnabled({ TERM: "dumb" }, true)).toBe(false);
	});

	it("ignores an empty NO_COLOR, per no-color.org", () => {
		expect(colorEnabled({ NO_COLOR: "" }, true)).toBe(true);
	});

	it("is forced on or off by FORCE_COLOR", () => {
		expect(colorEnabled({ FORCE_COLOR: "1" }, false)).toBe(true);
		expect(colorEnabled({ FORCE_COLOR: "0" }, true)).toBe(false);
		expect(colorEnabled({ FORCE_COLOR: "false" }, true)).toBe(false);
	});
});

describe("createStyle()", () => {
	it("emits ANSI codes only when enabled", () => {
		expect(createStyle(true).red("x")).not.toBe("x");
		expect(createStyle(false).red("x")).toBe("x");
	});
});

describe("formatTable()", () => {
	const plain = createStyle(false);

	it("aligns columns and pads to the widest cell", () => {
		const table = formatTable(
			[{ header: "ID", align: "right" }, { header: "TITLE" }],
			[
				["27205", "Inception"],
				["1", "Up"],
			],
			plain,
		);
		expect(table).toBe(["   ID  TITLE", "27205  Inception", "    1  Up"].join("\n"));
	});

	it("truncates cells longer than maxWidth", () => {
		const table = formatTable([{ header: "T", maxWidth: 5 }], [["abcdefgh"]], plain);
		expect(table.split("\n")[1]).toBe("abcd…");
	});

	it("keeps alignment when cells are styled", () => {
		const color = createStyle(true);
		const table = formatTable(
			[{ header: "A", style: (padded) => color.red(padded) }, { header: "B" }],
			[
				["x", "1"],
				["long", "2"],
			],
			color,
		);
		expect(stripVTControlCharacters(table)).toBe(["A     B", "x     1", "long  2"].join("\n"));
	});
});

describe("formatters", () => {
	it("formatYear() takes the year or a placeholder", () => {
		expect(formatYear("2010-07-15")).toBe("2010");
		expect(formatYear("")).toBe("—");
		expect(formatYear(undefined)).toBe("—");
	});

	it("formatRating() shows one decimal only when there are votes", () => {
		expect(formatRating(8.369, 35000)).toBe("8.4");
		expect(formatRating(0, 0)).toBe("—");
	});

	it("styleRating() colors by threshold", () => {
		const color = createStyle(true);
		expect(styleRating(color, "8.4", "8.4")).toBe(color.green("8.4"));
		expect(styleRating(color, "6.0", "6.0")).toBe(color.yellow("6.0"));
		expect(styleRating(color, "3.1", "3.1")).toBe(color.red("3.1"));
		expect(styleRating(color, "—", "—")).toBe(color.dim("—"));
	});

	it("formatJson() pretty-prints", () => {
		expect(formatJson({ a: 1 })).toBe('{\n  "a": 1\n}');
	});
});

describe("detail formatters", () => {
	it("formatRuntime() renders hours and minutes", () => {
		expect(formatRuntime(148)).toBe("2h 28m");
		expect(formatRuntime(120)).toBe("2h 00m");
		expect(formatRuntime(45)).toBe("45m");
		expect(formatRuntime(0)).toBeUndefined();
		expect(formatRuntime(undefined)).toBeUndefined();
	});

	it("formatCount() and plural() use stable en-US separators", () => {
		expect(formatCount(40234)).toBe("40,234");
		expect(plural(1, "season")).toBe("1 season");
		expect(plural(1200, "episode")).toBe("1,200 episodes");
	});

	it("formatVotes() omits unrated entries", () => {
		expect(formatVotes(8.369, 40234)).toBe("★ 8.4/10 (40,234 votes)");
		expect(formatVotes(7, 1)).toBe("★ 7.0/10 (1 vote)");
		expect(formatVotes(0, 0)).toBeUndefined();
	});

	it("withYear() appends the year only when known", () => {
		expect(withYear("Inception", "2010-07-15")).toBe("Inception (2010)");
		expect(withYear("Untitled", "")).toBe("Untitled");
	});

	it("truncateText() cuts at a word boundary", () => {
		expect(truncateText("short", 10)).toBe("short");
		expect(truncateText("the quick brown fox jumps", 12)).toBe("the quick…");
	});

	it("wrapText() wraps to width and keeps paragraphs", () => {
		expect(wrapText("aaa bbb ccc ddd", 7)).toBe("aaa bbb\nccc ddd");
		expect(wrapText("one\n\ntwo", 80)).toBe("one\n\ntwo");
		expect(wrapText("supercalifragilistic word", 5)).toBe("supercalifragilistic\nword");
	});

	it("formatDetail() renders header, facts, body, list and url, skipping empty parts", () => {
		const text = formatDetail(
			{
				title: "Inception (2010)",
				subtitle: "Your mind is the scene of the crime.",
				meta: ["Action", undefined, "2h 28m"],
				facts: [
					["Directed by", "Christopher Nolan"],
					["Status", undefined],
				],
				body: "A thief.",
				list: {
					title: "Cast",
					rows: [
						["Leonardo DiCaprio", "Dom Cobb"],
						["Tom Hardy", "Eames"],
					],
				},
				url: "https://www.themoviedb.org/movie/27205",
			},
			createStyle(false),
		);
		expect(text).toBe(
			[
				"Inception (2010)",
				"Your mind is the scene of the crime.",
				"Action · 2h 28m",
				"Directed by Christopher Nolan",
				"",
				"A thief.",
				"",
				"Cast",
				"  Leonardo DiCaprio  Dom Cobb",
				"  Tom Hardy          Eames",
				"",
				"https://www.themoviedb.org/movie/27205",
			].join("\n"),
		);
	});

	it("formatDetail() omits an empty list section", () => {
		const text = formatDetail({ title: "X", meta: [], facts: [], list: { title: "Cast", rows: [] }, url: "u" }, createStyle(false));
		expect(text).toBe("X\n\nu");
	});
});
