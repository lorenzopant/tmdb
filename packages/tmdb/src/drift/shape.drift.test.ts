// src/drift/shape.drift.test.ts

import { describe, expect, it } from "vitest";

import { TMDB } from "../tmdb";
import { CALLS } from "./endpoints";
import typeTrees from "./__generated__/type-tree.json";
import { diffShape, keyTree } from "./key-tree";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");

// Drift is a large batch of live HTTP calls run on a schedule. Enable
// rate_limit + retry so transient failures / 429s don't surface as noisy,
// false-positive drift alerts.
const tmdb = new TMDB(token, { rate_limit: true, retry: true });

// The baseline is DERIVED from the TS types (scripts/gen-type-tree.ts, committed as
// __generated__/type-tree.json), NOT from a previously-blessed API response. Drift therefore means
// "the live API and our declared model types disagree NOW" — the thing that actually breaks consumers.
const trees = typeTrees as Record<string, Record<string, boolean>>;

// A green run without this line could silently hide missing coverage — make the
// count visible so a shrinking CALLS list doesn't slip by unnoticed.
console.log(`drift: covering ${CALLS.length} shapes against TS types`);

function report(label: string, apiOnly: string[], removed: string[]): string {
	const lines = [`Schema drift for "${label}" (live TMDB response vs src/types):`];
	if (apiOnly.length) {
		lines.push("  Fields the API returns that your types DON'T declare — add them to src/types:");
		for (const path of apiOnly) lines.push(`    + ${path}`);
	}
	if (removed.length) {
		lines.push("  Required type fields the API did NOT return — the API renamed/removed it, or the type is wrong:");
		for (const path of removed) lines.push(`    - ${path}`);
	}
	lines.push("  If the change is intentional, update src/types and rerun `pnpm run test:drift`.");
	return lines.join("\n");
}

describe("Schema drift (live API shape vs TS types)", () => {
	it.each(CALLS)(
		"$label",
		async ({ label, call }) => {
			const typeTree = trees[label];
			expect(
				typeTree,
				`No type-tree for "${label}". Regenerate with \`pnpm run test:drift\` (runs scripts/gen-type-tree.ts).`,
			).toBeDefined();

			const res = await call(tmdb);
			const { apiOnly, removed } = diffShape(keyTree(res), typeTree);

			expect({ apiOnly, removed }, report(label, apiOnly, removed)).toEqual({
				apiOnly: [],
				removed: [],
			});
		},
		30_000,
	);
});
