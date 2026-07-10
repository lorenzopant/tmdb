// src/drift/shape.drift.test.ts

import { describe, expect, it } from "vitest";

import { TMDB } from "../tmdb";
import { CALLS } from "./endpoints";
import { keyTree } from "./key-tree";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");

// Drift is a large batch of live HTTP calls run on a schedule. Enable
// rate_limit + retry so transient failures / 429s don't surface as noisy,
// false-positive drift alerts.
const tmdb = new TMDB(token, { rate_limit: true, retry: true });

// A green run without this line could silently hide missing coverage — make the
// count visible so a shrinking CALLS list doesn't slip by unnoticed.
console.log(`drift: covering ${CALLS.length} shapes`);

describe("Schema drift (key-tree snapshots)", () => {
	it.each(CALLS)(
		"$label shape",
		async ({ call }) => {
			const res = await call(tmdb);
			expect(keyTree(res)).toMatchSnapshot();
		},
		30_000,
	);
});
