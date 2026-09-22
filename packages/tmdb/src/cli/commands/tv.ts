import type { TVSeriesDetails } from "../../types/tv-series";
import { parseIdArg } from "../args";
import type { CliCommand } from "../command";
import { formatDetail, formatJson, formatVotes, plural, TMDB_WEB_URL } from "../output";

const usage = `Usage: tmdb tv <id> [options]

Show a TV series' details, creators, networks and main cast across all seasons.

Options:
  -l, --language <l>  Response language, e.g. it-IT
  --json              Print the raw API response (details + aggregate credits)

Examples:
  tmdb tv 1396
  tmdb tv 1396 --json | jq '.number_of_episodes'

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

/** `tmdb tv <id>` — wraps `tmdb.tv_series.details` with `append_to_response: ["aggregate_credits"]`. */
export const tvCommand: CliCommand = {
	name: "tv",
	summary: "Show TV series details and cast",
	usage,
	async run({ positionals, json, io, style, width, getClient }) {
		const id = parseIdArg(positionals, "tmdb tv <id>");
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
