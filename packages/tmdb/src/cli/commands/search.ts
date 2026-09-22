import type { PaginatedResponse } from "../../types/common/pagination";
import type { MovieResultItem, MultiSearchResultItem, PersonResultItem, TVSeriesResultItem } from "../../types/search";
import { positiveIntFlag, stringFlag } from "../args";
import { CliUsageError, type CliCommand } from "../command";
import { EMPTY, formatJson, formatRating, formatTable, formatYear, styleRating, type Style, type TableColumn } from "../output";

const SEARCH_TYPES = ["multi", "movie", "tv", "person"] as const;
type SearchType = (typeof SEARCH_TYPES)[number];

const usage = `Usage: tmdb search <query> [options]

Search TMDB for movies, TV series and people.

Options:
  -t, --type <type>  multi (default), movie, tv, person
  -y, --year <year>  Filter by primary release year (movie) or first air year (tv)
  -p, --page <n>     Results page (default 1)
  -l, --language <l> Response language, e.g. it-IT
  --json             Print the raw API response

Examples:
  tmdb search inception
  tmdb search "breaking bad" --type tv
  tmdb search dune --type movie --year 2021 --json`;

type Row = { id: number; type: "movie" | "tv" | "person"; title: string; year: string; rating: string };

const movieRow = (item: MovieResultItem): Row => ({
	id: item.id,
	type: "movie",
	title: item.title,
	year: formatYear(item.release_date),
	rating: formatRating(item.vote_average, item.vote_count),
});

const tvRow = (item: TVSeriesResultItem): Row => ({
	id: item.id,
	type: "tv",
	title: item.name,
	year: formatYear(item.first_air_date),
	rating: formatRating(item.vote_average, item.vote_count),
});

const personRow = (item: PersonResultItem): Row => ({
	id: item.id,
	type: "person",
	title: item.known_for_department ? `${item.name} (${item.known_for_department})` : item.name,
	year: EMPTY,
	rating: EMPTY,
});

function multiRow(item: MultiSearchResultItem): Row {
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
		{ header: "TYPE", style: (padded, raw) => style[TYPE_COLOR[raw as Row["type"]]](padded) },
		{ header: "TITLE", maxWidth: 60 },
		{ header: "YEAR" },
		{ header: "RATING", align: "right", style: (padded, raw) => styleRating(style, padded, raw) },
	];
}

function parseType(value: string | undefined): SearchType {
	if (value === undefined) return "multi";
	if ((SEARCH_TYPES as readonly string[]).includes(value)) return value as SearchType;
	throw new CliUsageError(`--type must be one of ${SEARCH_TYPES.join(", ")}, got "${value}".`);
}

function parseYear(value: string | undefined, type: SearchType): string | undefined {
	if (value === undefined) return undefined;
	if (type !== "movie" && type !== "tv") throw new CliUsageError("--year only works with --type movie or --type tv.");
	if (!/^\d{4}$/.test(value)) throw new CliUsageError(`--year must be a 4-digit year, got "${value}".`);
	return value;
}

/** `tmdb search <query>` — wraps `tmdb.search.multi / movies / tv_series / person`. */
export const searchCommand: CliCommand = {
	name: "search",
	summary: "Search movies, TV series and people",
	usage,
	options: {
		type: { type: "string", short: "t" },
		year: { type: "string", short: "y" },
		page: { type: "string", short: "p" },
	},
	async run({ positionals, flags, json, io, style, getClient }) {
		const query = positionals.join(" ").trim();
		if (!query) throw new CliUsageError("Missing search query. Usage: tmdb search <query>");

		const type = parseType(stringFlag(flags, "type"));
		const year = parseYear(stringFlag(flags, "year"), type);
		const page = positiveIntFlag(flags, "page");
		const tmdb = await getClient();

		let response: PaginatedResponse<unknown>;
		let rows: Row[];
		switch (type) {
			case "movie": {
				const res = await tmdb.search.movies({ query, page, primary_release_year: year });
				[response, rows] = [res, res.results.map(movieRow)];
				break;
			}
			case "tv": {
				const res = await tmdb.search.tv_series({
					query,
					page,
					first_air_date_year: year === undefined ? undefined : Number(year),
				});
				[response, rows] = [res, res.results.map(tvRow)];
				break;
			}
			case "person": {
				const res = await tmdb.search.person({ query, page });
				[response, rows] = [res, res.results.map(personRow)];
				break;
			}
			case "multi": {
				const res = await tmdb.search.multi({ query, page });
				[response, rows] = [res, res.results.map(multiRow)];
				break;
			}
		}

		if (json) {
			io.stdout(formatJson(response));
			return;
		}

		if (rows.length === 0) {
			io.stdout(`No results for "${query}".`);
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
	},
};
