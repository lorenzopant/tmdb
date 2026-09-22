import type { PaginatedResponse } from "../../types/common/pagination";
import { positiveIntFlag } from "../args";
import { CliUsageError, type CliCommand } from "../command";
import { mixedRow, movieRow, personRow, printResults, tvRow, type ResultRow } from "../results";

const TRENDING_TYPES = ["all", "movie", "tv", "person"] as const;
type TrendingType = (typeof TRENDING_TYPES)[number];

const usage = `Usage: tmdb trending [all|movie|tv|person] [options]

Show what's trending on TMDB today (or this week).

Options:
  -w, --week          Trending this week instead of today
  -p, --page <n>      Results page (default 1)
  -l, --language <l>  Response language, e.g. it-IT
  --json              Print the raw API response

Examples:
  tmdb trending
  tmdb trending movie --week
  tmdb trending person --json | jq '.results[0].name'`;

function parseType(positionals: string[]): TrendingType {
	const [value = "all", ...extra] = positionals;
	if (extra.length > 0) throw new CliUsageError(`Unexpected arguments: ${extra.join(" ")}. Usage: tmdb trending [all|movie|tv|person]`);
	if ((TRENDING_TYPES as readonly string[]).includes(value)) return value as TrendingType;
	throw new CliUsageError(`Trending type must be one of ${TRENDING_TYPES.join(", ")}, got "${value}".`);
}

/** `tmdb trending [type]` — wraps `tmdb.trending.all / movies / tv / people`. */
export const trendingCommand: CliCommand = {
	name: "trending",
	summary: "Show trending movies, TV series and people",
	usage,
	options: {
		week: { type: "boolean", short: "w" },
		page: { type: "string", short: "p" },
	},
	async run(ctx) {
		const { positionals, flags, getClient } = ctx;
		const type = parseType(positionals);
		const params = { time_window: flags.week === true ? ("week" as const) : ("day" as const), page: positiveIntFlag(flags, "page") };
		const tmdb = await getClient();

		let response: PaginatedResponse<unknown>;
		let rows: ResultRow[];
		switch (type) {
			case "all": {
				const res = await tmdb.trending.all(params);
				[response, rows] = [res, res.results.map(mixedRow)];
				break;
			}
			case "movie": {
				const res = await tmdb.trending.movies(params);
				[response, rows] = [res, res.results.map(movieRow)];
				break;
			}
			case "tv": {
				const res = await tmdb.trending.tv(params);
				[response, rows] = [res, res.results.map(tvRow)];
				break;
			}
			case "person": {
				const res = await tmdb.trending.people(params);
				[response, rows] = [res, res.results.map(personRow)];
				break;
			}
		}

		printResults(ctx, response, rows, "Nothing is trending right now.");
	},
};
