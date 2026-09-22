/// <reference types="node" />
import { stripVTControlCharacters } from "node:util";

import { describe, expect, it } from "vitest";

import { colorEnabled, createStyle, formatJson, formatRating, formatTable, formatYear, styleRating } from "../../cli/output";

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
