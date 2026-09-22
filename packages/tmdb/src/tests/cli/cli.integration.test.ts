/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { run } from "../../cli/run";
import { createIO } from "./helpers";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");

/** Runs the CLI in-process against the live API, isolated from any local config file. */
async function cli(...argv: string[]) {
	const { io, stdout, stderr } = createIO();
	const code = await run(argv, { io, env: { TMDB_BEARER_TOKEN: token }, configPath: "/nonexistent/tmdb-cli-test/config.json" });
	return { code, stdout: stdout.join("\n"), stderr: stderr.join("\n") };
}

describe("CLI (integration)", () => {
	it("movie <id> --json returns the plain details payload, with no appends", async () => {
		const { code, stdout } = await cli("movie", "550", "--json");
		expect(code).toBe(0);
		const movie = JSON.parse(stdout);
		expect(movie.id).toBe(550);
		expect(typeof movie.title).toBe("string");
		expect(Array.isArray(movie.genres)).toBe(true);
		expect(movie).not.toHaveProperty("credits");
	});

	it("movie <id> --append credits adds the credits block", async () => {
		const { code, stdout } = await cli("movie", "550", "--append", "credits", "--json");
		expect(code).toBe(0);
		const movie = JSON.parse(stdout);
		expect(Array.isArray(movie.credits.cast)).toBe(true);
		expect(Array.isArray(movie.credits.crew)).toBe(true);
	});

	it("tv <id> renders the text view", async () => {
		const { code, stdout } = await cli("tv", "1396");
		expect(code).toBe(0);
		expect(stdout).toContain("https://www.themoviedb.org/tv/1396");
	});

	it("search --json returns a paginated response", async () => {
		const { code, stdout } = await cli("search", "fight club", "--type", "movie", "--json");
		expect(code).toBe(0);
		const response = JSON.parse(stdout);
		expect(response.page).toBe(1);
		expect(Array.isArray(response.results)).toBe(true);
		expect(typeof response.total_results).toBe("number");
	});

	it("movie popular --json returns a paginated list", async () => {
		const { code, stdout } = await cli("movie", "popular", "--json");
		expect(code).toBe(0);
		const response = JSON.parse(stdout);
		expect(response.page).toBe(1);
		expect(Array.isArray(response.results)).toBe(true);
	});

	it("exits with 1 and reports the TMDB error for an unknown id", async () => {
		const { code, stdout, stderr } = await cli("movie", "999999999");
		expect(code).toBe(1);
		expect(stdout).toBe("");
		expect(stderr).toMatch(/^Error: /);
	});
});
