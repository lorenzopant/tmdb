import { describe, expect, it, vi } from "vitest";

import { CliUsageError } from "../../../cli/command";
import { searchCommand } from "../../../cli/commands/search";
import { createContext, createIO, fakeClient } from "../helpers";

const page = <T>(results: T[], overrides = {}) => ({ page: 1, total_pages: 1, total_results: results.length, results, ...overrides });

const movie = { id: 27205, title: "Inception", release_date: "2010-07-15", vote_average: 8.369, vote_count: 35000 };
const tv = { id: 1396, name: "Breaking Bad", first_air_date: "2008-01-20", vote_average: 8.9, vote_count: 14000 };
const person = { id: 6193, name: "Leonardo DiCaprio", known_for_department: "Acting" };

function setup(flags: Record<string, string | boolean> = {}, positionals = ["inception"]) {
	const search = {
		multi: vi.fn().mockResolvedValue(
			page(
				[
					{ ...movie, media_type: "movie" },
					{ ...tv, media_type: "tv" },
					{ ...person, media_type: "person" },
				],
				{ total_pages: 3, total_results: 55 },
			),
		),
		movies: vi.fn().mockResolvedValue(page([movie])),
		tv_series: vi.fn().mockResolvedValue(page([tv])),
		person: vi.fn().mockResolvedValue(page([person])),
	};
	const { io, stdout } = createIO();
	const json = flags.json === true;
	const ctx = createContext({ positionals, flags, json, io, getClient: fakeClient({ search }) });
	return { ctx, search, stdout };
}

describe("tmdb search", () => {
	it("uses multi search by default and joins the query words", async () => {
		const { ctx, search } = setup({}, ["the", "dark", "knight"]);
		await searchCommand.run(ctx);
		expect(search.multi).toHaveBeenCalledWith({ query: "the dark knight", page: undefined });
	});

	it("renders a table with type, title, year and rating plus a pagination footer", async () => {
		const { ctx, stdout } = setup();
		await searchCommand.run(ctx);
		expect(stdout[0]).toBe(
			[
				"   ID  TYPE    TITLE                       YEAR  RATING",
				"27205  movie   Inception                   2010     8.4",
				" 1396  tv      Breaking Bad                2008     8.9",
				" 6193  person  Leonardo DiCaprio (Acting)  —          —",
			].join("\n"),
		);
		expect(stdout[1]).toBe("\nPage 1 of 3 · 55 results · next: --page 2");
	});

	it("routes --type to the matching endpoint with page and year", async () => {
		const movies = setup({ type: "movie", year: "2010", page: "2" });
		await searchCommand.run(movies.ctx);
		expect(movies.search.movies).toHaveBeenCalledWith({ query: "inception", page: 2, primary_release_year: "2010" });

		const series = setup({ type: "tv", year: "2008" });
		await searchCommand.run(series.ctx);
		expect(series.search.tv_series).toHaveBeenCalledWith({ query: "inception", page: undefined, first_air_date_year: 2008 });

		const people = setup({ type: "person" });
		await searchCommand.run(people.ctx);
		expect(people.search.person).toHaveBeenCalledWith({ query: "inception", page: undefined });
	});

	it("prints the raw response with --json", async () => {
		const { ctx, stdout } = setup({ type: "movie", json: true });
		await searchCommand.run(ctx);
		expect(JSON.parse(stdout.join("\n"))).toEqual(page([movie]));
	});

	it("says so when there are no results", async () => {
		const { ctx, search, stdout } = setup({ type: "movie" });
		search.movies.mockResolvedValue(page([]));
		await searchCommand.run(ctx);
		expect(stdout).toEqual(['No results for "inception".']);
	});

	it.each([
		[{}, []],
		[{ type: "collection" }, ["x"]],
		[{ year: "2010" }, ["x"]],
		[{ type: "movie", year: "10" }, ["x"]],
		[{ page: "0" }, ["x"]],
	])("rejects invalid input %j %j with CliUsageError before calling the API", async (flags, positionals) => {
		const { ctx, search } = setup(flags as Record<string, string>, positionals as string[]);
		await expect(searchCommand.run(ctx)).rejects.toThrow(CliUsageError);
		expect(search.multi).not.toHaveBeenCalled();
	});
});
