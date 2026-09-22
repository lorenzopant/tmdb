import type { PersonCombinedCastCredit, PersonCombinedCrewCredit } from "../../types/people";
import { parseIdArg } from "../args";
import type { CliCommand } from "../command";
import { formatDetail, formatJson, TMDB_WEB_URL, truncateText, withYear } from "../output";

const usage = `Usage: tmdb person <id> [options]

Show a person's details, short biography and best-known credits.

Options:
  -l, --language <l>  Response language (affects the biography), e.g. it-IT
  --json              Print the raw API response (details + combined credits)

Examples:
  tmdb person 6193
  tmdb person 525 --json | jq '.combined_credits.crew | length'

Find ids with \`tmdb search <query> --type person\`.`;

/** Number of credits listed under "Known for". */
const KNOWN_FOR_LIMIT = 5;

/** Maximum biography length before it is truncated (the full text is in `--json`). */
const BIO_LIMIT = 600;

type CombinedCredit = PersonCombinedCastCredit | PersonCombinedCrewCredit;

const creditTitle = (credit: CombinedCredit) =>
	credit.media_type === "movie" ? withYear(credit.title, credit.release_date) : withYear(credit.name, credit.first_air_date);

const creditRole = (credit: CombinedCredit) => ("character" in credit ? credit.character : credit.job) || "—";

/**
 * Picks the best-known credits: cast credits for actors; for everyone else, crew credits in their own
 * department (a director's "Director" jobs rather than "Producer"), falling back to all crew credits.
 * Deduplicated per title and ranked by vote count.
 */
function knownFor(department: string | undefined, cast: PersonCombinedCastCredit[], crew: PersonCombinedCrewCredit[]): CombinedCredit[] {
	const inDepartment = crew.filter((credit) => credit.department === department);
	const credits: CombinedCredit[] = department === "Acting" || crew.length === 0 ? cast : inDepartment.length > 0 ? inDepartment : crew;
	const unique = new Map<string, CombinedCredit>();
	for (const credit of credits) {
		const key = `${credit.media_type}:${credit.id}`;
		if (!unique.has(key)) unique.set(key, credit);
	}
	return [...unique.values()].sort((a, b) => b.vote_count - a.vote_count).slice(0, KNOWN_FOR_LIMIT);
}

/** `tmdb person <id>` — wraps `tmdb.people.details` with `append_to_response: ["combined_credits"]`. */
export const personCommand: CliCommand = {
	name: "person",
	summary: "Show person details and known-for credits",
	usage,
	async run({ positionals, json, io, style, width, getClient }) {
		const id = parseIdArg(positionals, "tmdb person <id>");
		const tmdb = await getClient();
		const person = await tmdb.people.details({ person_id: id, append_to_response: ["combined_credits"] });

		if (json) {
			io.stdout(formatJson(person));
			return;
		}

		const lifespan = person.birthday
			? person.deathday
				? `${person.birthday} – ${person.deathday}`
				: `Born ${person.birthday}`
			: undefined;
		const credits = knownFor(person.known_for_department, person.combined_credits.cast, person.combined_credits.crew);

		io.stdout(
			formatDetail(
				{
					title: person.name,
					meta: [person.known_for_department, lifespan],
					facts: [["Born in", person.place_of_birth]],
					body: person.biography ? truncateText(person.biography, BIO_LIMIT) : undefined,
					list: {
						title: "Known for",
						rows: credits.map((credit) => [creditTitle(credit), `${creditRole(credit)} · ${credit.media_type}`]),
					},
					url: `${TMDB_WEB_URL}/person/${person.id}`,
				},
				style,
				width,
			),
		);
	},
};
