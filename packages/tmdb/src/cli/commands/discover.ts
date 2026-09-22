import type { TMDB } from "../../tmdb";
import type { Genre } from "../../types/common/media";
import type { DiscoverMovieSortBy, DiscoverTVSortBy } from "../../types/discover";
import { DiscoverMovieQueryBuilder, DiscoverTVQueryBuilder } from "../../utils/discover-query-builder";
import { positiveIntFlag, stringFlag, type CliFlags } from "../args";
import { CliUsageError, type CliCommand } from "../command";
import { movieRow, printResults, tvRow } from "../results";

type MediaType = "movie" | "tv";

/** CLI sort keys → TMDB `sort_by` field, per media type. `undefined` = not supported for that type. */
const SORT_FIELDS: Record<string, Record<MediaType, string | undefined>> = {
	popularity: { movie: "popularity", tv: "popularity" },
	rating: { movie: "vote_average", tv: "vote_average" },
	votes: { movie: "vote_count", tv: "vote_count" },
	date: { movie: "primary_release_date", tv: "first_air_date" },
	title: { movie: "title", tv: "name" },
	revenue: { movie: "revenue", tv: undefined },
};

/** Minimum vote count applied by default when sorting by rating, so 10/10 titles with a single vote don't dominate. */
const RATING_SORT_MIN_VOTES = 200;

const usage = `Usage: tmdb discover <movie|tv> [options]

Find movies or TV series by genre, year, rating and more.

Options:
  -g, --genre <genres>   Genre names or ids. "a,b" = all of them, "a|b" = any of them
                         (e.g. "action,comedy", "drama|crime", 878). Names are English.
  -y, --year <year>      Primary release year (movie) / first air year (tv)
  --min-rating <n>       Minimum vote average, 0-10
  --min-votes <n>        Minimum vote count (default ${RATING_SORT_MIN_VOTES} with --sort rating)
  -s, --sort <key>       popularity (default), rating, votes, date, title, revenue (movie only)
  --asc                  Sort ascending (default descending)
  -p, --page <n>         Results page (default 1)
  -l, --language <l>     Response language, e.g. it-IT
  --json                 Print the raw API response

Examples:
  tmdb discover movie --genre "science fiction" --year 2014 --sort rating
  tmdb discover tv --genre "drama|crime" --min-rating 8
  tmdb discover movie -g action,comedy -s date`;

/** Lowercases and strips everything but letters/digits so "Science Fiction", "science-fiction" and "sciencefiction" match. */
const normalize = (name: string) => name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

function parseMediaType(positionals: string[]): MediaType {
	const [value, ...extra] = positionals;
	if (value === undefined) throw new CliUsageError("Missing media type. Usage: tmdb discover <movie|tv>");
	if (extra.length > 0) throw new CliUsageError(`Unexpected arguments: ${extra.join(" ")}. Usage: tmdb discover <movie|tv>`);
	if (value === "movie" || value === "tv") return value;
	throw new CliUsageError(`Media type must be "movie" or "tv", got "${value}".`);
}

function parseNumberFlag(flags: CliFlags, name: string, min: number, max = Number.POSITIVE_INFINITY): number | undefined {
	const raw = stringFlag(flags, name);
	if (raw === undefined) return undefined;
	const value = Number(raw);
	if (raw.trim() === "" || Number.isNaN(value) || value < min || value > max) {
		throw new CliUsageError(
			`--${name} must be a number${Number.isFinite(max) ? ` between ${min} and ${max}` : ` ≥ ${min}`}, got "${raw}".`,
		);
	}
	return value;
}

function parseYear(flags: CliFlags): number | undefined {
	const raw = stringFlag(flags, "year");
	if (raw === undefined) return undefined;
	if (!/^\d{4}$/.test(raw)) throw new CliUsageError(`--year must be a 4-digit year, got "${raw}".`);
	return Number(raw);
}

function parseSort(flags: CliFlags, type: MediaType): { key: string; sortBy: string } {
	const key = stringFlag(flags, "sort") ?? "popularity";
	const fields = SORT_FIELDS[key];
	if (!fields) throw new CliUsageError(`--sort must be one of ${Object.keys(SORT_FIELDS).join(", ")}, got "${key}".`);
	const field = fields[type];
	if (!field) throw new CliUsageError(`--sort ${key} is not available for ${type}.`);
	return { key, sortBy: `${field}.${flags.asc === true ? "asc" : "desc"}` };
}

/** Splits a `--genre` value into tokens and the combination mode. Mixing `,` and `|` is ambiguous and rejected. */
function splitGenres(raw: string): { mode: "and" | "or"; tokens: string[] } {
	if (raw.includes(",") && raw.includes("|")) throw new CliUsageError('--genre cannot mix "," (all) and "|" (any).');
	const mode = raw.includes("|") ? "or" : "and";
	const tokens = raw
		.split(/[,|]/)
		.map((token) => token.trim())
		.filter(Boolean);
	if (tokens.length === 0) throw new CliUsageError("--genre is empty.");
	return { mode, tokens };
}

/**
 * Resolves genre tokens to ids. Numeric tokens are used as-is; names are matched against TMDB's English genre list
 * (fetched only when a name is present) so matching doesn't depend on `--language`.
 */
async function resolveGenres(tokens: string[], type: MediaType, tmdb: TMDB): Promise<number[]> {
	if (tokens.every((token) => /^\d+$/.test(token))) return tokens.map(Number);

	const list: Genre[] = (
		type === "movie" ? await tmdb.genres.movie_list({ language: "en-US" }) : await tmdb.genres.tv_list({ language: "en-US" })
	).genres;
	const byName = new Map(list.map((genre) => [normalize(genre.name), genre.id]));

	return tokens.map((token) => {
		if (/^\d+$/.test(token)) return Number(token);
		const id = byName.get(normalize(token));
		if (id === undefined) {
			throw new CliUsageError(
				`Unknown ${type} genre "${token}". Available: ${list.map((genre) => genre.name.toLowerCase()).join(", ")}.`,
			);
		}
		return id;
	});
}

/** `tmdb discover <movie|tv>` — maps flags onto `DiscoverMovieQueryBuilder` / `DiscoverTVQueryBuilder`. */
export const discoverCommand: CliCommand = {
	name: "discover",
	summary: "Find movies or TV series by genre, year and rating",
	usage,
	options: {
		genre: { type: "string", short: "g" },
		year: { type: "string", short: "y" },
		"min-rating": { type: "string" },
		"min-votes": { type: "string" },
		sort: { type: "string", short: "s" },
		asc: { type: "boolean" },
		page: { type: "string", short: "p" },
	},
	async run(ctx) {
		const { positionals, flags, getClient } = ctx;

		// Validate everything before any network call.
		const type = parseMediaType(positionals);
		const year = parseYear(flags);
		const minRating = parseNumberFlag(flags, "min-rating", 0, 10);
		const minVotes =
			parseNumberFlag(flags, "min-votes", 0) ?? (stringFlag(flags, "sort") === "rating" ? RATING_SORT_MIN_VOTES : undefined);
		const sort = parseSort(flags, type);
		const page = positiveIntFlag(flags, "page");
		const genreArg = stringFlag(flags, "genre");
		const genres = genreArg === undefined ? undefined : splitGenres(genreArg);

		const tmdb = await getClient();
		const genreIds = genres ? await resolveGenres(genres.tokens, type, tmdb) : undefined;

		const builder = type === "movie" ? new DiscoverMovieQueryBuilder() : new DiscoverTVQueryBuilder();
		if (genres && genreIds) builder.withGenres(genres.mode, genreIds);
		if (minRating !== undefined) builder.voteAverage({ gte: minRating });
		if (minVotes !== undefined) builder.voteCount({ gte: minVotes });
		if (page !== undefined) builder.page(page);

		if (builder instanceof DiscoverMovieQueryBuilder) {
			if (year !== undefined) builder.primaryReleaseYear(year);
			builder.sortBy(sort.sortBy as DiscoverMovieSortBy);
			const response = await tmdb.discover.movie(builder.build());
			printResults(ctx, response, response.results.map(movieRow), "No movies match these filters.");
		} else {
			if (year !== undefined) builder.firstAirDateYear(year);
			builder.sortBy(sort.sortBy as DiscoverTVSortBy);
			const response = await tmdb.discover.tv(builder.build());
			printResults(ctx, response, response.results.map(tvRow), "No TV series match these filters.");
		}
	},
};
