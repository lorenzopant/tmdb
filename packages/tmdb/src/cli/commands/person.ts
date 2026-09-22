import type {
	PersonAppendToResponseNamespace,
	PersonCombinedCastCredit,
	PersonCombinedCredits,
	PersonCombinedCrewCredit,
	PersonDetails,
} from "../../types/people";
import { APPEND_OPTION, appendFlag, parseIdArg } from "../args";
import type { CliCommand } from "../command";
import { formatAppendNote, formatDetail, formatJson, TMDB_WEB_URL, truncateText, withYear } from "../output";

/** Every `append_to_response` namespace of `/person/{id}`. `satisfies Record<…>` makes the compiler flag additions to the SDK union. */
const PERSON_APPENDS = Object.keys({
	changes: true,
	combined_credits: true,
	external_ids: true,
	images: true,
	movie_credits: true,
	tagged_images: true,
	translations: true,
	tv_credits: true,
} satisfies Record<PersonAppendToResponseNamespace, true>) as PersonAppendToResponseNamespace[];

/** Appends the text view renders; the rest are only visible with `--json`. */
const RENDERED_APPENDS = ["combined_credits"] as const;

const usage = `Usage: tmdb person <id> [options]

Show a person's details and short biography.
Details are exactly what TMDB's /person/{id} returns; add more data with --append.

Options:
  -a, --append <list> Extra data in the same request, comma-separated:
                      ${PERSON_APPENDS.join(", ")}
                      "combined_credits" adds their best-known movies and shows to the view.
  -l, --language <l>  Response language (affects the biography), e.g. it-IT
  --json              Print the raw API response

Examples:
  tmdb person 6193
  tmdb person 6193 --append combined_credits
  tmdb person 525 -a external_ids --json | jq '.external_ids.imdb_id'

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

/** `tmdb person <id>` — wraps `tmdb.people.details`; appends only via `--append`. */
export const personCommand: CliCommand = {
	name: "person",
	summary: "Show person details",
	usage,
	options: APPEND_OPTION,
	async run({ positionals, flags, json, io, style, width, getClient }) {
		const id = parseIdArg(positionals, "tmdb person <id>");
		const appends = appendFlag(flags, PERSON_APPENDS);
		const tmdb = await getClient();
		// Only send append_to_response when asked for, so the default request is exactly GET /person/{id}.
		const person: PersonDetails & { combined_credits?: PersonCombinedCredits } = await tmdb.people.details(
			appends.length > 0 ? { person_id: id, append_to_response: appends } : { person_id: id },
		);

		if (json) {
			io.stdout(formatJson(person));
			return;
		}

		const lifespan = person.birthday
			? person.deathday
				? `${person.birthday} – ${person.deathday}`
				: `Born ${person.birthday}`
			: undefined;
		const credits = person.combined_credits
			? knownFor(person.known_for_department, person.combined_credits.cast, person.combined_credits.crew)
			: [];

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
		const note = formatAppendNote(style, appends, RENDERED_APPENDS, "--append combined_credits adds their best-known credits.");
		if (note) io.stdout(note);
	},
};
