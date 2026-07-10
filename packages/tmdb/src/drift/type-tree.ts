// src/drift/type-tree.ts

import { type Node, Project, SyntaxKind, type Type } from "ts-morph";

import { isDynamicKey } from "./key-tree";

/**
 * Builds the STATIC counterpart of `keyTree`: given a TS response type, it produces the exact same
 * property-path format that `keyTree` derives from a live JSON response — so the two can be diffed
 * directly (see `diffShape`). This makes the TS types the source of truth for drift instead of a
 * previously-blessed API snapshot.
 *
 * Parity with `keyTree` (src/drift/key-tree.ts):
 * - arrays collapse to a single `[]` segment,
 * - data-keyed dictionaries collapse to `{}` — whether the type expresses them as an index
 *   signature (`Record<string, V>`) OR as a literal-union key map (`Record<CountryISO3166_1, V>`,
 *   which resolves to discrete `US`/`GB`/... props that `isDynamicKey` folds into `{}`),
 * - static schema keys keep their literal name.
 *
 * Unlike `keyTree`, each path also carries an `effectiveOptional` flag (see return type) because
 * the types know optionality and the live sample does not — an optional field the API happened not
 * to populate must NOT be reported as drift.
 */

const DYNAMIC_KEY_SEGMENT = "{}";
// Backstop against pathological/self-referential types. Real TMDB responses are far shallower;
// cycle detection below is the primary guard, this just bounds any edge case.
const MAX_DEPTH = 25;

function join(prefix: string, segment: string): string {
	return prefix ? `${prefix}.${segment}` : segment;
}

/**
 * Primitive types are LEAVES — exactly as `keyTree` treats primitive JSON values. Without this the
 * walker would descend into the prototype (`string.charAt`, `number.toFixed`, `boolean.valueOf`, ...)
 * and emit thousands of phantom paths that no JSON response could ever contain.
 */
function isPrimitiveLeaf(type: Type): boolean {
	// `LiteralUnion<T> = T | (string & {})` (src/types/utility.ts) yields a `string & {}` member:
	// an intersection whose apparent type is still a string primitive. Treat any intersection with a
	// primitive constituent as a leaf so we don't descend into String/Number prototype members.
	if (type.isIntersection()) return type.getIntersectionTypes().some(isPrimitiveLeaf);
	return (
		type.isString() ||
		type.isNumber() ||
		type.isBoolean() ||
		type.isBigInt() ||
		type.isStringLiteral() ||
		type.isNumberLiteral() ||
		type.isBooleanLiteral() ||
		type.isBigIntLiteral() ||
		type.isEnum() ||
		type.isEnumLiteral() ||
		type.isTemplateLiteral()
	);
}

/** Unwrap `Promise<T>` (and any accidental nesting) to its awaited type. */
function unwrapPromise(type: Type): Type {
	let current = type;
	while (current.getSymbol()?.getName() === "Promise") {
		const arg = current.getTypeArguments()[0];
		if (!arg) break;
		current = arg;
	}
	return current;
}

/**
 * A path is recorded as `true` when it — or any ancestor — is optional. Such a path being absent
 * from the live response is expected (the API just didn't populate it), so `diffShape` ignores it.
 * A `false` path is required: its absence from the live response is genuine drift.
 */
function add(out: Map<string, boolean>, path: string, optional: boolean): void {
	// Optional wins across union members: a field required in one member but absent/optional in
	// another is effectively optional, so we never false-flag it as removed.
	out.set(path, out.has(path) ? out.get(path)! || optional : optional);
}

function walk(
	type: Type,
	prefix: string,
	optional: boolean,
	at: Node,
	out: Map<string, boolean>,
	seen: Set<unknown>,
	depth: number,
): void {
	if (depth > MAX_DEPTH) return;

	const members = type.isUnion() ? type.getUnionTypes() : [type];

	// Object members of a union. A property present on only SOME of them is effectively optional:
	// the live response only carries it when the value happens to be that variant (e.g. `known_for[]`
	// is `movie | tv`, so tv-only fields are absent when the entry is a movie). Counting occurrences
	// lets us mark such fields optional instead of false-flagging them as removed.
	const objectMembers = members.filter(isWalkableObject);
	const memberCount = objectMembers.length;
	const nameCounts = new Map<string, number>();
	if (memberCount > 1) {
		for (const om of objectMembers) {
			for (const prop of om.getProperties()) {
				nameCounts.set(prop.getName(), (nameCounts.get(prop.getName()) ?? 0) + 1);
			}
		}
	}

	for (const member of members) {
		if (
			member.isUndefined() ||
			member.isNull() ||
			member.isVoid() ||
			member.isNever() ||
			member.isAny() ||
			member.isUnknown()
		) {
			continue;
		}

		// Primitives are leaves — the key itself was already recorded by the parent (like keyTree).
		if (isPrimitiveLeaf(member)) continue;

		if (member.isArray()) {
			const element = member.getArrayElementType();
			if (element) walk(element, `${prefix}[]`, optional, at, out, seen, depth + 1);
			continue;
		}

		// `Record<string, V>` / index signatures → data-keyed dictionary → "{}".
		const indexType = member.getStringIndexType() ?? member.getNumberIndexType();
		if (indexType) {
			const path = join(prefix, DYNAMIC_KEY_SEGMENT);
			add(out, path, optional);
			walk(indexType, path, optional, at, out, seen, depth + 1);
		}

		const props = member.getProperties();
		if (props.length === 0) continue;

		// Break true cycles (self-referential types) along the current DFS branch only.
		const id = member.compilerType;
		if (seen.has(id)) continue;
		const branch = new Set(seen);
		branch.add(id);

		for (const prop of props) {
			const name = prop.getName();
			// `Record<CountryISO3166_1, V>` resolves to literal country props (US, GB, ...);
			// collapse them to the same "{}" the runtime keyTree emits for data-keyed dicts.
			const segment = isDynamicKey(name) ? DYNAMIC_KEY_SEGMENT : name;
			const path = join(prefix, segment);
			const propType = prop.getTypeAtLocation(at);
			const notInEveryVariant = memberCount > 1 && (nameCounts.get(name) ?? 0) < memberCount;
			const childOptional =
				optional || prop.isOptional() || propType.isNullable() || notInEveryVariant;
			add(out, path, childOptional);
			walk(propType.getNonNullableType(), path, childOptional, at, out, branch, depth + 1);
		}
	}
}

/** An object-like type worth recursing into (has properties or an index signature). */
function isWalkableObject(type: Type): boolean {
	if (
		type.isUndefined() ||
		type.isNull() ||
		type.isVoid() ||
		type.isNever() ||
		type.isAny() ||
		type.isUnknown() ||
		type.isArray() ||
		isPrimitiveLeaf(type)
	) {
		return false;
	}
	return (
		type.getProperties().length > 0 ||
		type.getStringIndexType() != null ||
		type.getNumberIndexType() != null
	);
}

/**
 * Extracts the key-tree of a single endpoint's response type.
 * @param returnType the `Promise<T>` return type of a `CALLS` row's `call`
 * @param at a node used as the resolution context for property types
 * @returns `{ path -> effectiveOptional }`, sorted by path
 */
export function typeKeyTree(returnType: Type, at: Node): Record<string, boolean> {
	const out = new Map<string, boolean>();
	walk(unwrapPromise(returnType), "", false, at, out, new Set(), 0);
	return Object.fromEntries(
		[...out.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
	);
}

/**
 * Loads the tmdb package, reads every row of the `CALLS` registry in `endpoints.ts`, resolves each
 * row's real declared response type off the arrow function, and returns `{ label -> typeKeyTree }`.
 * This is the build step that turns the TS types into the drift baseline.
 */
export function buildTypeTrees(tsConfigFilePath: string): Record<string, Record<string, boolean>> {
	const project = new Project({ tsConfigFilePath });
	const source = project.getSourceFileOrThrow("src/drift/endpoints.ts");
	const initializer = source.getVariableDeclarationOrThrow("CALLS").getInitializerOrThrow();

	// `CALLS` is `defineCalls([...])`; unwrap to the array literal (also tolerate a bare array).
	const array =
		initializer.asKind(SyntaxKind.ArrayLiteralExpression) ??
		initializer
			.asKindOrThrow(SyntaxKind.CallExpression)
			.getArguments()[0]
			.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);

	const trees: Record<string, Record<string, boolean>> = {};
	for (const element of array.getElements()) {
		const object = element.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

		const label = object
			.getPropertyOrThrow("label")
			.asKindOrThrow(SyntaxKind.PropertyAssignment)
			.getInitializerOrThrow()
			.asKindOrThrow(SyntaxKind.StringLiteral)
			.getLiteralText();

		const callFn = object
			.getPropertyOrThrow("call")
			.asKindOrThrow(SyntaxKind.PropertyAssignment)
			.getInitializerOrThrow();

		const returnType = callFn.getType().getCallSignatures()[0].getReturnType();
		trees[label] = typeKeyTree(returnType, callFn);
	}

	return trees;
}
