import type { PaginatedResponse } from "../types/common/pagination";
import type { MovieResultItem, PersonResultItem, TVSeriesResultItem } from "../types/search";
import type { CliContext } from "./command";
import { EMPTY, formatJson, formatRating, formatTable, formatYear, styleRating, type Style, type TableColumn } from "./output";

/** One line of a results table (search, trending, discover, lists). */
export type ResultRow = { id: number; type: "movie" | "tv" | "person"; title: string; year: string; rating: string };

type MovieLike = Pick<MovieResultItem, "id" | "title" | "release_date" | "vote_average" | "vote_count">;
type TVLike = Pick<TVSeriesResultItem, "id" | "name" | "first_air_date" | "vote_average" | "vote_count">;
type PersonLike = Pick<PersonResultItem, "id" | "name" | "known_for_department">;

/** Any list item tagged with its media type (multi search, trending "all"). */
export type MixedResultItem =
	| (MovieLike & { media_type: "movie" })
	| (TVLike & { media_type: "tv" })
	| (PersonLike & { media_type: "person" });

export const movieRow = (item: MovieLike): ResultRow => ({
	id: item.id,
	type: "movie",
	title: item.title,
	year: formatYear(item.release_date),
	rating: formatRating(item.vote_average, item.vote_count),
});

export const tvRow = (item: TVLike): ResultRow => ({
	id: item.id,
	type: "tv",
	title: item.name,
	year: formatYear(item.first_air_date),
	rating: formatRating(item.vote_average, item.vote_count),
});

export const personRow = (item: PersonLike): ResultRow => ({
	id: item.id,
	type: "person",
	title: item.known_for_department ? `${item.name} (${item.known_for_department})` : item.name,
	year: EMPTY,
	rating: EMPTY,
});

export function mixedRow(item: MixedResultItem): ResultRow {
	switch (item.media_type) {
		case "movie":
			return movieRow(item);
		case "tv":
			return tvRow(item);
		case "person":
			return personRow(item);
	}
}

const TYPE_COLOR = { movie: "cyan", tv: "magenta", person: "yellow" } as const;

function columns(style: Style): TableColumn[] {
	return [
		{ header: "ID", align: "right", style: (padded) => style.dim(padded) },
		{ header: "TYPE", style: (padded, raw) => style[TYPE_COLOR[raw as ResultRow["type"]]](padded) },
		{ header: "TITLE", maxWidth: 60 },
		{ header: "YEAR" },
		{ header: "RATING", align: "right", style: (padded, raw) => styleRating(style, padded, raw) },
	];
}

/**
 * Prints a paginated response: raw JSON with `--json`, otherwise a results table with a pagination footer,
 * or `emptyMessage` when there are no results.
 */
export function printResults(
	ctx: Pick<CliContext, "json" | "io" | "style">,
	response: PaginatedResponse<unknown>,
	rows: ResultRow[],
	emptyMessage: string,
): void {
	const { json, io, style } = ctx;

	if (json) {
		io.stdout(formatJson(response));
		return;
	}

	if (rows.length === 0) {
		io.stdout(emptyMessage);
		return;
	}

	io.stdout(
		formatTable(
			columns(style),
			rows.map((row) => [String(row.id), row.type, row.title, row.year, row.rating]),
			style,
		),
	);

	const footer = `Page ${response.page} of ${response.total_pages} · ${response.total_results} results`;
	const next = response.page < response.total_pages ? ` · next: --page ${response.page + 1}` : "";
	io.stdout(style.dim(`\n${footer}${next}`));
}
