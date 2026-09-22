import type { PaginatedResponse } from "../../types/common/pagination";
import type { CountryISO3166_1 } from "../../types/config/countries";
import type { MovieAppendToResponseNamespace, MovieCredits, MovieDateRangeList, MovieDetails } from "../../types/movies";
import type { MovieResultItem } from "../../types/search";
import { APPEND_OPTION, appendFlag, parseIdArg, parseListArg, positiveIntFlag, regionFlag, rejectListFlags } from "../args";
import { CliUsageError, type CliCommand, type CliContext } from "../command";
import { formatAppendNote, formatDetail, formatJson, formatRuntime, formatVotes, TMDB_WEB_URL, withYear } from "../output";
import { movieRow, printResults } from "../results";

const MOVIE_LISTS = ["now_playing", "popular", "top_rated", "upcoming"] as const;
type MovieList = (typeof MOVIE_LISTS)[number];

/** Every `append_to_response` namespace of `/movie/{id}`. `satisfies Record<…>` makes the compiler flag additions to the SDK union. */
const MOVIE_APPENDS = Object.keys({
	alternative_titles: true,
	changes: true,
	credits: true,
	external_ids: true,
	images: true,
	keywords: true,
	recommendations: true,
	release_dates: true,
	reviews: true,
	similar: true,
	translations: true,
	videos: true,
	"watch/providers": true,
} satisfies Record<MovieAppendToResponseNamespace, true>) as MovieAppendToResponseNamespace[];

/** Appends the text view renders; the rest are only visible with `--json`. */
const RENDERED_APPENDS = ["credits"] as const;

const usage = `Usage: tmdb movie <id> [options]
       tmdb movie <list> [options]

Show a movie's details — or one of TMDB's curated movie lists.
Details are exactly what TMDB's /movie/{id} returns; add more data with --append.

Lists:
  now_playing   In theaters now
  popular       Most popular right now
  top_rated     Highest rated of all time
  upcoming      Releasing soon
  (dashes work too: top-rated, now-playing)

Options:
  -a, --append <list>   Extra data in the same request (details only), comma-separated:
                        ${MOVIE_APPENDS.join(", ")}
                        "credits" adds the director and top-billed cast to the view.
  -p, --page <n>        Results page (lists only)
  -r, --region <code>   Country for release dates, e.g. IT (lists only)
  -l, --language <l>    Response language, e.g. it-IT
  --json                Print the raw API response

Examples:
  tmdb movie 27205
  tmdb movie 27205 --append credits
  tmdb movie 550 -a credits,videos --json | jq '.videos.results[0].key'
  tmdb movie popular
  tmdb movie now-playing --region IT -p 2

Find ids with \`tmdb search <query> --type movie\`.`;

/** Number of cast members listed. */
const CAST_LIMIT = 5;

const LIST_TITLES: Record<MovieList, string> = {
	now_playing: "now playing",
	popular: "popular",
	top_rated: "top rated",
	upcoming: "upcoming",
};

/** `tmdb movie <list>` — wraps `tmdb.movie_lists.*`. */
async function runList(ctx: CliContext, list: MovieList): Promise<void> {
	const params = { page: positiveIntFlag(ctx.flags, "page"), region: regionFlag(ctx.flags) as CountryISO3166_1 | undefined };
	const tmdb = await ctx.getClient();
	// now_playing / upcoming also return the release window they cover.
	const response: PaginatedResponse<MovieResultItem> & Partial<Pick<MovieDateRangeList, "dates">> = await tmdb.movie_lists[list](params);
	printResults(ctx, response, response.results.map(movieRow), `No ${LIST_TITLES[list]} movies found.`);
	if (!ctx.json && response.dates && response.results.length > 0) {
		ctx.io.stdout(ctx.style.dim(`Release window: ${response.dates.minimum} – ${response.dates.maximum}`));
	}
}

/** `tmdb movie <id|list>` — details via `tmdb.movies.details` (appends only via `--append`), or a curated list via `tmdb.movie_lists`. */
export const movieCommand: CliCommand = {
	name: "movie",
	summary: "Show movie details, or a list (popular, top_rated…)",
	usage,
	options: {
		...APPEND_OPTION,
		page: { type: "string", short: "p" },
		region: { type: "string", short: "r" },
	},
	async run(ctx) {
		const { positionals, flags, json, io, style, width, getClient } = ctx;
		const list = parseListArg(positionals, MOVIE_LISTS, "movie");
		if (list) {
			if (flags.append !== undefined)
				throw new CliUsageError("--append only applies to details, e.g. `tmdb movie 550 --append credits`.");
			return runList(ctx, list);
		}

		rejectListFlags(flags, ["page", "region"], "`tmdb movie popular --page 2`");
		const id = parseIdArg(positionals, "tmdb movie <id|list>");
		const appends = appendFlag(flags, MOVIE_APPENDS);
		const tmdb = await getClient();
		// Only send append_to_response when asked for, so the default request is exactly GET /movie/{id}.
		const movie: MovieDetails & { credits?: MovieCredits } = await tmdb.movies.details(
			appends.length > 0 ? { movie_id: id, append_to_response: appends } : { movie_id: id },
		);

		if (json) {
			io.stdout(formatJson(movie));
			return;
		}

		const directors = movie.credits?.crew.filter((member) => member.job === "Director").map((member) => member.name) ?? [];

		io.stdout(
			formatDetail(
				{
					title: withYear(movie.title, movie.release_date),
					subtitle: movie.tagline,
					meta: [
						movie.genres.map((genre) => genre.name).join(", "),
						formatRuntime(movie.runtime),
						formatVotes(movie.vote_average, movie.vote_count),
					],
					facts: [
						["Directed by", directors.join(", ")],
						["Original title", movie.original_title !== movie.title ? movie.original_title : undefined],
						["Status", movie.status !== "Released" ? movie.status : undefined],
					],
					body: movie.overview,
					list: movie.credits && {
						title: "Cast",
						rows: movie.credits.cast.slice(0, CAST_LIMIT).map((member) => [member.name, member.character]),
					},
					url: `${TMDB_WEB_URL}/movie/${movie.id}`,
				},
				style,
				width,
			),
		);
		const note = formatAppendNote(style, appends, RENDERED_APPENDS, "--append credits adds the director and cast.");
		if (note) io.stdout(note);
	},
};
