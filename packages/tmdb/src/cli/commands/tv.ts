import type { TVAggregateCredits, TVAppendToResponseNamespace, TVCredits, TVSeriesDetails } from "../../types/tv-series";
import { APPEND_OPTION, appendFlag, parseIdArg, parseListArg, positiveIntFlag, rejectListFlags } from "../args";
import { CliUsageError, type CliCommand, type CliContext } from "../command";
import { formatAppendNote, formatDetail, formatJson, formatVotes, plural, TMDB_WEB_URL } from "../output";
import { printResults, tvRow } from "../results";

const TV_LISTS = ["airing_today", "on_the_air", "popular", "top_rated"] as const;
type TVList = (typeof TV_LISTS)[number];

/** Every `append_to_response` namespace of `/tv/{id}`. `satisfies Record<…>` makes the compiler flag additions to the SDK union. */
const TV_APPENDS = Object.keys({
	aggregate_credits: true,
	alternative_titles: true,
	changes: true,
	content_ratings: true,
	credits: true,
	episode_groups: true,
	external_ids: true,
	images: true,
	keywords: true,
	lists: true,
	recommendations: true,
	reviews: true,
	screened_theatrically: true,
	similar: true,
	translations: true,
	videos: true,
	"watch/providers": true,
} satisfies Record<TVAppendToResponseNamespace, true>) as TVAppendToResponseNamespace[];

/** Appends the text view renders; the rest are only visible with `--json`. */
const RENDERED_APPENDS = ["aggregate_credits", "credits"] as const;

type SeriesWithCredits = TVSeriesDetails & { aggregate_credits?: TVAggregateCredits; credits?: TVCredits };

/**
 * Cast rows for the view: `aggregate_credits` (every season, with episode counts) when present,
 * otherwise `credits` (the latest season's cast), otherwise nothing.
 */
function castRows(series: SeriesWithCredits): [string, string][] | undefined {
	if (series.aggregate_credits) {
		return series.aggregate_credits.cast.slice(0, CAST_LIMIT).map((member) => {
			const character = member.roles[0]?.character || "—";
			return [member.name, `${character} · ${plural(member.total_episode_count, "episode")}`];
		});
	}
	return series.credits?.cast.slice(0, CAST_LIMIT).map((member) => [member.name, member.character || "—"]);
}

const usage = `Usage: tmdb tv <id> [options]
       tmdb tv <list> [options]

Show a TV series' details — or one of TMDB's curated TV lists.
Details are exactly what TMDB's /tv/{id} returns; add more data with --append.

Lists:
  airing_today  Episodes airing today
  on_the_air    Episodes airing in the next 7 days
  popular       Most popular right now
  top_rated     Highest rated of all time
  (dashes work too: top-rated, on-the-air)

Options:
  -a, --append <list> Extra data in the same request (details only), comma-separated:
                      ${TV_APPENDS.join(", ")}
                      "aggregate_credits" adds the cast across all seasons to the view,
                      "credits" the latest season's cast.
  -p, --page <n>      Results page (lists only)
  -l, --language <l>  Response language, e.g. it-IT
  --json              Print the raw API response

Examples:
  tmdb tv 1396
  tmdb tv 1396 --append aggregate_credits
  tmdb tv 1396 -a content_ratings --json | jq '.content_ratings.results[0]'
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

/** `tmdb tv <id|list>` — details via `tmdb.tv_series.details` (appends only via `--append`), or a curated list via `tmdb.tv_lists`. */
export const tvCommand: CliCommand = {
	name: "tv",
	summary: "Show TV series details, or a list (popular, top_rated…)",
	usage,
	options: {
		...APPEND_OPTION,
		page: { type: "string", short: "p" },
	},
	async run(ctx) {
		const { positionals, flags, json, io, style, width, getClient } = ctx;
		const list = parseListArg(positionals, TV_LISTS, "tv");
		if (list) {
			if (flags.append !== undefined)
				throw new CliUsageError("--append only applies to details, e.g. `tmdb tv 1396 --append credits`.");
			return runList(ctx, list);
		}

		rejectListFlags(flags, ["page"], "`tmdb tv popular --page 2`");
		const id = parseIdArg(positionals, "tmdb tv <id|list>");
		const appends = appendFlag(flags, TV_APPENDS);
		const tmdb = await getClient();
		// Only send append_to_response when asked for, so the default request is exactly GET /tv/{id}.
		const series: SeriesWithCredits = await tmdb.tv_series.details(
			appends.length > 0 ? { series_id: id, append_to_response: appends } : { series_id: id },
		);

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
					list: { title: "Cast", rows: castRows(series) ?? [] },
					url: `${TMDB_WEB_URL}/tv/${series.id}`,
				},
				style,
				width,
			),
		);
		const note = formatAppendNote(style, appends, RENDERED_APPENDS, "--append aggregate_credits adds the cast.");
		if (note) io.stdout(note);
	},
};
