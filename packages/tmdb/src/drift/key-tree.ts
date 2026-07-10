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

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDynamicKey(key: string): boolean {
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
