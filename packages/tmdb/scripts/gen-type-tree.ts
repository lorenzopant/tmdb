// scripts/gen-type-tree.ts
//
// Regenerates the drift baseline FROM the TypeScript types. Run as the first step of `test:drift`
// (and any time src/types changes) so the committed type-tree.json always reflects the current
// model types. The drift test then diffs live TMDB responses against this file.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildTypeTrees } from "../src/drift/type-tree";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = resolve(packageRoot, "src/drift/__generated__/type-tree.json");

const trees = buildTypeTrees(resolve(packageRoot, "tsconfig.json"));

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(trees, null, 2)}\n`);

console.log(`type-tree: wrote ${Object.keys(trees).length} shapes -> ${outFile}`);
