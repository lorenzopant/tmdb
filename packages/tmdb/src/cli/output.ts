import { stripVTControlCharacters } from "node:util";

import { Chalk, type ChalkInstance } from "chalk";

export type Style = ChalkInstance;

/**
 * Decides whether to emit ANSI colors for a stream.
 *
 * - `NO_COLOR` (non-empty) disables colors — https://no-color.org
 * - `FORCE_COLOR` enables them unless set to `0` / `false`
 * - Otherwise colors are on only for an interactive terminal that isn't `TERM=dumb`, so piped output stays plain.
 */
export function colorEnabled(env: NodeJS.ProcessEnv, isTTY: boolean): boolean {
	if (env.NO_COLOR) return false;
	if (env.FORCE_COLOR !== undefined) return env.FORCE_COLOR !== "0" && env.FORCE_COLOR !== "false";
	return isTTY && env.TERM !== "dumb";
}

/** Returns a chalk instance with colors on (basic 16-color palette) or off. */
export function createStyle(enabled: boolean): Style {
	return new Chalk({ level: enabled ? 1 : 0 });
}

export type TableColumn = {
	header: string;
	align?: "left" | "right";
	/** Truncates longer cells with an ellipsis. */
	maxWidth?: number;
	/** Styles a cell after padding. Receives the padded text and the raw cell value. */
	style?: (padded: string, raw: string) => string;
};

/** Code point ranges rendered two columns wide in terminals (East Asian Wide/Fullwidth, emoji). */
const WIDE_RANGES: [number, number][] = [
	[0x1100, 0x115f],
	[0x2e80, 0x303e],
	[0x3041, 0x33ff],
	[0x3400, 0x4dbf],
	[0x4e00, 0x9fff],
	[0xa000, 0xa4cf],
	[0xac00, 0xd7a3],
	[0xf900, 0xfaff],
	[0xfe30, 0xfe4f],
	[0xff00, 0xff60],
	[0xffe0, 0xffe6],
	[0x1f300, 0x1f64f],
	[0x1f900, 0x1f9ff],
	[0x20000, 0x3fffd],
];

/** Terminal columns taken by one code point: 0 for combining marks, 2 for wide characters, 1 otherwise. */
function charWidth(codePoint: number): number {
	if ((codePoint >= 0x0300 && codePoint <= 0x036f) || codePoint === 0x200d || (codePoint >= 0xfe00 && codePoint <= 0xfe0f)) return 0;
	return WIDE_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end) ? 2 : 1;
}

/** Terminal display width of a string, ignoring ANSI escape codes and counting wide (CJK) characters as 2 columns. */
export function displayWidth(text: string): number {
	let width = 0;
	for (const char of stripVTControlCharacters(text)) width += charWidth(char.codePointAt(0) ?? 0);
	return width;
}

/** Pads plain text to `width` display columns. */
export function padDisplay(text: string, width: number, align: "left" | "right" = "left"): string {
	const padding = " ".repeat(Math.max(0, width - displayWidth(text)));
	return align === "right" ? padding + text : text + padding;
}

/** Truncates plain text to at most `maxWidth` display columns, ending with `…`. */
function truncate(text: string, maxWidth: number | undefined): string {
	if (maxWidth === undefined || displayWidth(text) <= maxWidth) return text;
	let out = "";
	let width = 0;
	for (const char of text) {
		const w = charWidth(char.codePointAt(0) ?? 0);
		if (width + w > maxWidth - 1) break;
		out += char;
		width += w;
	}
	return `${out}…`;
}

/**
 * Renders rows as a left/right-aligned, space-separated table with a bold header.
 * Cells are plain text; colors come from each column's `style`, applied after padding so alignment is preserved.
 */
export function formatTable(columns: TableColumn[], rows: string[][], style: Style): string {
	const cells = rows.map((row) => row.map((cell, i) => truncate(cell, columns[i]?.maxWidth)));
	const widths = columns.map((column, i) => Math.max(column.header.length, ...cells.map((row) => displayWidth(row[i] ?? ""))));

	const pad = (text: string, i: number) => padDisplay(text, widths[i] ?? 0, columns[i]?.align);

	const header = columns.map((column, i) => style.bold(pad(column.header, i))).join("  ");
	const body = cells.map((row) =>
		row
			.map((cell, i) => {
				const padded = pad(cell, i);
				return columns[i]?.style ? columns[i].style(padded, cell) : padded;
			})
			.join("  ")
			.trimEnd(),
	);
	return [header.trimEnd(), ...body].join("\n");
}

/** Pretty-prints a value as JSON for `--json` output. */
export function formatJson(data: unknown): string {
	return JSON.stringify(data, null, 2);
}

/** Placeholder for missing values in tables. */
export const EMPTY = "—";

/** `"2010-07-15"` → `"2010"`; missing or empty dates → {@link EMPTY}. */
export function formatYear(date: string | undefined): string {
	return date ? date.slice(0, 4) : EMPTY;
}

/** Formats a TMDB vote average to one decimal, or {@link EMPTY} when there are no votes. */
export function formatRating(average: number | undefined, count: number | undefined): string {
	return average !== undefined && count ? average.toFixed(1) : EMPTY;
}

/** Colors a rating string: green ≥ 7, yellow ≥ 5, red below. */
export function styleRating(style: Style, padded: string, raw: string): string {
	const value = Number(raw);
	if (Number.isNaN(value)) return style.dim(padded);
	if (value >= 7) return style.green(padded);
	if (value >= 5) return style.yellow(padded);
	return style.red(padded);
}

/** `148` → `"2h 28m"`, `45` → `"45m"`; missing or zero → `undefined` so callers can skip it. */
export function formatRuntime(minutes: number | undefined): string | undefined {
	if (!minutes) return undefined;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return hours ? `${hours}h ${String(rest).padStart(2, "0")}m` : `${rest}m`;
}

/** Thousands separators, locale-independent so output is stable: `35000` → `"35,000"`. */
export function formatCount(value: number): string {
	return value.toLocaleString("en-US");
}

/** Word-wraps plain text to `width` columns, preserving paragraph breaks. */
export function wrapText(text: string, width: number): string {
	return text
		.split(/\n+/)
		.map((paragraph) => {
			const lines: string[] = [];
			let line = "";
			for (const word of paragraph.split(/\s+/).filter(Boolean)) {
				if (line && line.length + 1 + word.length > width) {
					lines.push(line);
					line = word;
				} else {
					line = line ? `${line} ${word}` : word;
				}
			}
			if (line) lines.push(line);
			return lines.join("\n");
		})
		.filter(Boolean)
		.join("\n\n");
}

/** Content of a single-entity view (`tmdb movie`, `tmdb tv`, `tmdb person`). Empty/undefined parts are skipped. */
export type DetailView = {
	/** Headline, e.g. `"Inception (2010)"`. */
	title: string;
	/** Short line under the title (tagline). */
	subtitle?: string;
	/** Facts joined with ` · ` on one line (genres, runtime, rating…). */
	meta: (string | undefined)[];
	/** Extra labelled lines, e.g. `["Directed by", "Christopher Nolan"]`. */
	facts: [label: string, value: string | undefined][];
	/** Long description, word-wrapped. */
	body?: string;
	/** A titled two-column list (cast, known for). */
	list?: { title: string; rows: [left: string, right: string][] };
	/** Link to the entity on themoviedb.org. */
	url: string;
};

/** Default maximum line width for wrapped text. */
export const MAX_WIDTH = 100;

/** Renders a {@link DetailView} as a compact, sectioned block of text. */
export function formatDetail(view: DetailView, style: Style, width = MAX_WIDTH): string {
	const blocks: string[] = [];

	const head = [style.bold(view.title)];
	if (view.subtitle) head.push(style.italic.dim(view.subtitle));
	const meta = view.meta.filter(Boolean).join(" · ");
	if (meta) head.push(meta);
	for (const [label, value] of view.facts) if (value) head.push(`${style.dim(label)} ${value}`);
	blocks.push(head.join("\n"));

	if (view.body) blocks.push(wrapText(view.body, width));

	if (view.list && view.list.rows.length > 0) {
		const leftWidth = Math.max(...view.list.rows.map(([left]) => displayWidth(left)));
		const rows = view.list.rows.map(([left, right]) => `  ${padDisplay(left, leftWidth)}  ${style.dim(right)}`.trimEnd());
		blocks.push([style.bold(view.list.title), ...rows].join("\n"));
	}

	blocks.push(style.dim(view.url));
	return blocks.join("\n\n");
}

/** `"Inception", "2010-07-15"` → `"Inception (2010)"`; the year is omitted when unknown. */
export function withYear(title: string, date: string | undefined): string {
	return date ? `${title} (${date.slice(0, 4)})` : title;
}

/** `★ 8.4/10 (35,000 votes)`, or `undefined` when there are no votes. */
export function formatVotes(average: number | undefined, count: number | undefined): string | undefined {
	if (average === undefined || !count) return undefined;
	return `★ ${average.toFixed(1)}/10 (${formatCount(count)} ${count === 1 ? "vote" : "votes"})`;
}

/** `1, "season"` → `"1 season"`, `5, "season"` → `"5 seasons"`. */
export function plural(count: number, noun: string): string {
	return `${formatCount(count)} ${noun}${count === 1 ? "" : "s"}`;
}

/** Shortens text to at most `max` characters, cutting at a word boundary and appending `…`. */
export function truncateText(text: string, max: number): string {
	if (text.length <= max) return text;
	const cut = text.slice(0, max - 1);
	const lastSpace = cut.lastIndexOf(" ");
	return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Base URL of TMDB entity pages. */
export const TMDB_WEB_URL = "https://www.themoviedb.org";
