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

/** Visible width of a string, ignoring ANSI escape codes. */
function visibleWidth(text: string): number {
	return stripVTControlCharacters(text).length;
}

function truncate(text: string, maxWidth: number | undefined): string {
	if (maxWidth === undefined || text.length <= maxWidth) return text;
	return `${text.slice(0, maxWidth - 1)}…`;
}

/**
 * Renders rows as a left/right-aligned, space-separated table with a bold header.
 * Cells are plain text; colors come from each column's `style`, applied after padding so alignment is preserved.
 */
export function formatTable(columns: TableColumn[], rows: string[][], style: Style): string {
	const cells = rows.map((row) => row.map((cell, i) => truncate(cell, columns[i]?.maxWidth)));
	const widths = columns.map((column, i) => Math.max(column.header.length, ...cells.map((row) => visibleWidth(row[i] ?? ""))));

	const pad = (text: string, i: number) => (columns[i]?.align === "right" ? text.padStart(widths[i] ?? 0) : text.padEnd(widths[i] ?? 0));

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
