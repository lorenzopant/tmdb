import { parseIdArg } from "../args";
import type { CliCommand } from "../command";
import { formatDetail, formatJson, formatRuntime, formatVotes, TMDB_WEB_URL, withYear } from "../output";

const usage = `Usage: tmdb movie <id> [options]

Show a movie's details, director and top-billed cast.

Options:
  -l, --language <l>  Response language, e.g. it-IT
  --json              Print the raw API response (details + credits)

Examples:
  tmdb movie 27205
  tmdb movie 550 --json | jq '.credits.cast[0].name'

Find ids with \`tmdb search <query> --type movie\`.`;

/** Number of cast members listed. */
const CAST_LIMIT = 5;

/** `tmdb movie <id>` — wraps `tmdb.movies.details` with `append_to_response: ["credits"]`. */
export const movieCommand: CliCommand = {
	name: "movie",
	summary: "Show movie details and cast",
	usage,
	async run({ positionals, json, io, style, width, getClient }) {
		const id = parseIdArg(positionals, "tmdb movie <id>");
		const tmdb = await getClient();
		const movie = await tmdb.movies.details({ movie_id: id, append_to_response: ["credits"] });

		if (json) {
			io.stdout(formatJson(movie));
			return;
		}

		const directors = movie.credits.crew.filter((member) => member.job === "Director").map((member) => member.name);

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
					list: {
						title: "Cast",
						rows: movie.credits.cast.slice(0, CAST_LIMIT).map((member) => [member.name, member.character]),
					},
					url: `${TMDB_WEB_URL}/movie/${movie.id}`,
				},
				style,
				width,
			),
		);
	},
};
