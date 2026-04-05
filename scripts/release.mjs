#!/usr/bin/env node
/**
 * Release script — bumps the package version, commits, pushes to main, and
 * pushes a git tag.  GitHub Actions picks up the tag push and handles the
 * actual `npm publish --provenance` so that npm's OIDC-backed provenance
 * attestation works correctly.
 *
 * Usage (via package.json scripts):
 *   pnpm release:patch
 *   pnpm release:minor
 *   pnpm release:major
 *   pnpm release:beta-patch   (prepatch, preid=beta)
 *   pnpm release:beta-minor
 *   pnpm release:beta-major
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const VALID_TYPES = ["patch", "minor", "major", "prepatch", "preminor", "premajor"];
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = resolve(root, "packages/tmdb");

const bumpType = process.argv[2];
const dryRun = process.argv.includes("--dry-run");

if (!bumpType || !VALID_TYPES.includes(bumpType)) {
	console.error(`Error: bump type must be one of: ${VALID_TYPES.join(", ")}`);
	console.error(`Usage: node scripts/release.mjs <bump-type> [--dry-run]`);
	process.exit(1);
}

if (dryRun) console.log("[dry-run] No commands will be executed.\n");

const run = (cmd, cwd = root) => {
	if (dryRun) {
		console.log(`[dry-run] ${cmd}`);
		return;
	}
	execSync(cmd, { stdio: "inherit", cwd });
};
const capture = (cmd) => execSync(cmd, { cwd: root }).toString().trim();

// Guard: working tree must be clean
const dirty = capture("git status --porcelain");
if (dirty) {
	console.error("Error: working tree is not clean. Commit or stash your changes first.");
	process.exit(1);
}

// Guard: must be on main
const branch = capture("git rev-parse --abbrev-ref HEAD");
if (branch !== "main") {
	console.error(`Error: releases must be made from 'main' (currently on '${branch}').`);
	process.exit(1);
}

// Pull latest changes
run("git pull --rebase origin main");

// Bump version in packages/tmdb only (no git tag — we do that manually below)
const versionArgs = bumpType.startsWith("pre") ? "--preid=beta" : "";
const versionCmd = `npm version ${bumpType} ${versionArgs} --no-git-tag-version`
	.trim()
	.replace(/\s+/g, " ");

let version;
if (dryRun) {
	// --dry-run prints the would-be version without modifying the file
	const output = execSync(`${versionCmd} --dry-run`, { cwd: packageDir }).toString().trim();
	version = output.replace(/^v/, "");
	console.log(`[dry-run] ${versionCmd}  →  would bump to v${version}`);
} else {
	run(versionCmd, packageDir);
	version = JSON.parse(readFileSync(resolve(root, "packages/tmdb/package.json"), "utf-8")).version;
}
const tag = `v${version}`;

console.log(`\nReleasing ${tag}...`);

run("git add packages/tmdb/package.json");
run(`git commit -m "🚀 chore: release ${tag}"`);
run("git push origin main");
run(`git tag ${tag}`);
run(`git push origin ${tag}`);

console.log(`\nDone! Tag ${tag} pushed — GitHub Actions will build and publish to npm.`);
