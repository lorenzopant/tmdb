import type { TVSeriesDetails } from "../../types/tv-series";
import { parseIdArg, parseListArg, positiveIntFlag, rejectListFlags } from "../args";
import type { CliCommand, CliContext } from "../command";
import { formatDetail, formatJson, formatVotes, plural, TMDB_WEB_URL } from "../output";
import { printResults, tvRow } from "../results";

const TV_LISTS = ["airing_today", "on_the_air", "popular", "top_rated"] as const;
type TVList = (typeof TV_LISTS)[number];

const usage = `Usage: tmdb tv <id> [options]
       tmdb tv <list> [options]

Show a TV series' details, creators, networks and main cast across all seasons — or one of TMDB's curated TV lists.

Lists:
  airing_today  Episodes airing today
  on_the_air    Episodes airing in the next 7 days
  popular       Most popular right now
  top_rated     Highest rated of all time
  (dashes work too: top-rated, on-the-air)

Options:
  -p, --page <n>      Results page (lists only)
  -l, --language <l>  Response language, e.g. it-IT
  --json              Print the raw API response

Examples:
  tmdb tv 1396
  tmdb tv 1396 --json | jq '.number_of_episodes'
  tmdb tv top-rated
  tmdb tv airing_today -p 2

Find ids with \`tmdb search <query> --type tv\`.`;

/** Number of cast members listed. */
const CAST_LIMIT = 5;

/** Statuses after which a series has a final year. */
const FINISHED_STATUSES = new Set(["Ended", "Canceled"]);

/** `"Breaking Bad (2008–2013)"` for finished series, `"… (2019–)"` for running ones. */
function titleWithYears(series: TVSeriesDetails): string {
	const first = series.first_air_date?.slice(0, 4);
	if (!first) return series.name;
	const last = series.last_air_date?.slice(0, 4);
	if (!FINISHED_STATUSES.has(series.status ?? "")) return `${series.name} (${first}–)`;
	return last && last !== first ? `${series.name} (${first}–${last})` : `${series.name} (${first})`;
}

const LIST_TITLES: Record<TVList, string> = {
	airing_today: "airing today",
	on_the_air: "on the air",
	popular: "popular",
	top_rated: "top rated",
};

/** `tmdb tv <list>` — wraps `tmdb.tv_lists.*`. */
async function runList(ctx: CliContext, list: TVList): Promise<void> {
	const tmdb = await ctx.getClient();
	const response = await tmdb.tv_lists[list]({ page: positiveIntFlag(ctx.flags, "page") });
	printResults(ctx, response, response.results.map(tvRow), `No ${LIST_TITLES[list]} TV series found.`);
}

/** `tmdb tv <id|list>` — details via `tmdb.tv_series.details` (+ aggregate credits), or a curated list via `tmdb.tv_lists`. */
export const tvCommand: CliCommand = {
	name: "tv",
	summary: "Show TV series details, or a list (popular, top_rated…)",
	usage,
	options: {
		page: { type: "string", short: "p" },
	},
	async run(ctx) {
		const { positionals, flags, json, io, style, width, getClient } = ctx;
		const list = parseListArg(positionals, TV_LISTS, "tv");
		if (list) return runList(ctx, list);

		rejectListFlags(flags, ["page"], "`tmdb tv popular --page 2`");
		const id = parseIdArg(positionals, "tmdb tv <id|list>");
		const tmdb = await getClient();
		const series = await tmdb.tv_series.details({ series_id: id, append_to_response: ["aggregate_credits"] });

		if (json) {
			io.stdout(formatJson(series));
			return;
		}

		const episodes = series.number_of_seasons
			? `${plural(series.number_of_seasons, "season")}, ${plural(series.number_of_episodes, "episode")}`
			: undefined;

		io.stdout(
			formatDetail(
				{
					title: titleWithYears(series),
					subtitle: series.tagline,
					meta: [
						series.genres.map((genre) => genre.name).join(", "),
						episodes,
						formatVotes(series.vote_average, series.vote_count),
					],
					facts: [
						["Created by", series.created_by.map((creator) => creator.name).join(", ")],
						["Networks", series.networks?.map((network) => network.name).join(", ")],
						["Status", series.status],
					],
					body: series.overview,
					list: {
						title: "Cast",
						rows: series.aggregate_credits.cast.slice(0, CAST_LIMIT).map((member) => {
							const character = member.roles[0]?.character || "—";
							return [member.name, `${character} · ${plural(member.total_episode_count, "episode")}`];
						}),
					},
					url: `${TMDB_WEB_URL}/tv/${series.id}`,
				},
				style,
				width,
			),
		);
	},
};
