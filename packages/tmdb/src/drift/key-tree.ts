// src/drift/key-tree.ts

/**
 * Keys that TMDB uses as DICTIONARY keys — i.e. the key IS a data value (a country code,
 * a locale, a numeric id), not a schema property. Collapsing these to a single `{}` segment
 * keeps `keyTree` value-blind: a new country/provider/id from TMDB or JustWatch must NOT be
 * reported as schema drift. Extend this list if TMDB introduces another data-keyed dictionary.
 */
const DYNAMIC_KEY_PATTERNS: RegExp[] = [
	/^[A-Z]{2}$/, // country / uppercase 2-letter region code (e.g. "US", "GB")
	/^[a-z]{2}-[A-Z]{2}$/, // locale (e.g. "en-US", "pt-BR")
	/^[A-Z]{2}-[A-Z0-9]{1,3}$/, // region subdivision (e.g. "CA-QC") — appears in certifications
	/^\d+$/, // purely numeric id (e.g. provider / display-priority id)
];

const DYNAMIC_KEY_SEGMENT = "{}";

/**
 * `ChangeItem.value` / `ChangeItem.original_value` (src/types/common/changes.ts) hold whatever
 * payload TMDB's change-tracking endpoints attach for a given `key` (images, videos, cast,
 * episode groups, ...). TMDB documents no schema for these and the shape varies by `key` — and
 * by the day, as TMDB ships new change kinds. The type deliberately leaves them as `object | string`;
 * `keyTree` must stop at the same boundary or every new/changed nested field reads as drift.
 * These names are used nowhere else in src/types (verified via grep), so matching by name is safe.
 */
const OPAQUE_KEYS = new Set(["value", "original_value"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isDynamicKey(key: string): boolean {
	return DYNAMIC_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Recursively walks a value and records every property path it exposes, discarding all values.
 * Used to build a "key-tree" snapshot of an API response shape so that schema drift (properties
 * added/removed by the upstream API) can be detected independently of editorial/content changes.
 */
function walk(value: unknown, prefix: string, paths: Set<string>): void {
	if (Array.isArray(value)) {
		// Union the paths of every element under a single `[]` segment so that
		// fields only present on some (heterogeneous/optional) elements are still captured.
		const arrayPrefix = `${prefix}[]`;
		for (const item of value) {
			walk(item, arrayPrefix, paths);
		}
		return;
	}

	if (isPlainObject(value)) {
		for (const key of Object.keys(value)) {
			// Data-keyed dictionary entries all fold into a shared `{}` segment and union
			// their recursed paths (like array `[]`). Static schema keys keep their literal
			// name — an object may freely mix the two, each key handled independently.
			const segment = isDynamicKey(key) ? DYNAMIC_KEY_SEGMENT : key;
			const path = prefix ? `${prefix}.${segment}` : segment;
			paths.add(path);
			if (OPAQUE_KEYS.has(key)) continue;
			walk(value[key], path, paths);
		}
		return;
	}

	// Primitives (including null): nothing further to record. The key itself was
	// already emitted by the parent object/array — a `null` value still counts as present.
}

/**
 * Builds a sorted, de-duplicated list of property paths present in `value`.
 * Value-blind: only the SET of keys/paths is captured, never the underlying values.
 *
 * @example
 * keyTree({ a: 1, b: { c: 2 } }) // ["a", "b", "b.c"]
 * keyTree({ results: [{ id: 1 }, { id: 2, extra: true }] }) // ["results", "results[].extra", "results[].id"]
 */
export function keyTree(value: unknown): string[] {
	const paths = new Set<string>();
	walk(value, "", paths);
	return [...paths].sort();
}

/**
 * Result of comparing a live API key-tree against the key-tree derived from our TS types.
 * The types are the source of truth: drift is any disagreement between what the API sends
 * NOW and what the types declare.
 */
export type ShapeDiff = {
	/** Paths the live API returned that our types do NOT declare — types are out of date, add them. */
	apiOnly: string[];
	/** REQUIRED type paths the live API did NOT return — API dropped/renamed a field, or the type is wrong. */
	removed: string[];
};

/**
 * Diffs a live-response key-tree (`keyTree(res)`) against a type-derived tree
 * (`{ path -> effectiveOptional }`, produced by `typeKeyTree`).
 *
 * Asymmetric by design:
 * - Every `apiOnly` path is drift (the API sends a field the types don't know about).
 * - A type-only path is drift ONLY when it is required. An OPTIONAL type path absent from the
 *   live sample is normal (TMDB simply didn't populate it for the chosen fixture id), not drift.
 */
export function diffShape(apiPaths: string[], typeTree: Record<string, boolean>): ShapeDiff {
	const typePaths = new Set(Object.keys(typeTree));
	const api = new Set(apiPaths);
	const apiOnly = apiPaths.filter((path) => !typePaths.has(path));

	// A required type path missing from the live response is only real drift if its container was
	// actually OBSERVED — i.e. some sibling path exists under the same object/array. When a fixture
	// returns an empty array or omits an object entirely (e.g. `changes` with no changes in the date
	// range, or `find` with only movie_results populated), the container is unobservable and its
	// declared children must NOT be reported as removed.
	const observed = (container: string): boolean =>
		container === "" ||
		apiPaths.some(
			(path) =>
				path === container ||
				(path.startsWith(container) &&
					(path[container.length] === "." || path[container.length] === "[")),
		);

	const removed = Object.keys(typeTree).filter((path) => {
		if (typeTree[path]) return false; // effectively optional → ignore when the API omits it
		if (api.has(path)) return false; // present in the live response → fine
		const dot = path.lastIndexOf(".");
		return observed(dot < 0 ? "" : path.slice(0, dot));
	});

	return { apiOnly, removed };
}
