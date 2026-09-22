import { describe, expect, it, vi } from "vitest";

import { CliUsageError } from "../../../cli/command";
import { movieCommand } from "../../../cli/commands/movie";
import { tvCommand } from "../../../cli/commands/tv";
import { createContext, createIO, fakeClient } from "../helpers";

const page = <T>(results: T[], extra = {}) => ({ page: 1, total_pages: 2, total_results: 40, results, ...extra });
const movie = { id: 550, title: "Fight Club", release_date: "1999-10-15", vote_average: 8.4, vote_count: 30000 };
const series = { id: 1396, name: "Breaking Bad", first_air_date: "2008-01-20", vote_average: 8.9, vote_count: 18000 };

function setup(positionals: string[], flags: Record<string, string | boolean> = {}, json = false) {
	const movie_lists = {
		now_playing: vi.fn().mockResolvedValue(page([movie], { dates: { minimum: "2026-08-12", maximum: "2026-09-23" } })),
		popular: vi.fn().mockResolvedValue(page([movie])),
		top_rated: vi.fn().mockResolvedValue(page([])),
		upcoming: vi.fn().mockResolvedValue(page([movie], { dates: { minimum: "2026-09-24", maximum: "2026-10-15" } })),
	};
	const tv_lists = {
		airing_today: vi.fn().mockResolvedValue(page([series])),
		on_the_air: vi.fn().mockResolvedValue(page([series])),
		popular: vi.fn().mockResolvedValue(page([series])),
		top_rated: vi.fn().mockResolvedValue(page([series])),
	};
	const details = vi.fn();
	const { io, stdout } = createIO();
	const client = { movie_lists, tv_lists, movies: { details }, tv_series: { details } };
	const ctx = createContext({ positionals, flags, json, io, getClient: fakeClient(client) });
	return { ctx, movie_lists, tv_lists, details, stdout };
}

describe("tmdb movie <list>", () => {
	it.each(["now_playing", "popular", "top_rated", "upcoming"] as const)("routes %s to movie_lists.%s", async (list) => {
		const { ctx, movie_lists, details } = setup([list]);
		await movieCommand.run(ctx);
		expect(movie_lists[list]).toHaveBeenCalledWith({ page: undefined, region: undefined });
		expect(details).not.toHaveBeenCalled();
	});

	it("passes --page and an uppercased --region, and accepts dashed names", async () => {
		const { ctx, movie_lists } = setup(["now-playing"], { page: "2", region: "it" });
		await movieCommand.run(ctx);
		expect(movie_lists.now_playing).toHaveBeenCalledWith({ page: 2, region: "IT" });
	});

	it("renders the results table and the release window for dated lists", async () => {
		const { ctx, stdout } = setup(["now_playing"]);
		await movieCommand.run(ctx);
		expect(stdout[0]).toContain("550  movie  Fight Club  1999     8.4");
		expect(stdout[1]).toBe("\nPage 1 of 2 · 40 results · next: --page 2");
		expect(stdout[2]).toBe("Release window: 2026-08-12 – 2026-09-23");
	});

	it("omits the release window for undated lists and in --json mode", async () => {
		const popular = setup(["popular"]);
		await movieCommand.run(popular.ctx);
		expect(popular.stdout.join("\n")).not.toContain("Release window");

		const json = setup(["upcoming"], {}, true);
		await movieCommand.run(json.ctx);
		expect(json.stdout).toHaveLength(1);
		expect(JSON.parse(json.stdout[0] ?? "").dates.minimum).toBe("2026-09-24");
	});

	it("prints a friendly message for an empty list", async () => {
		const { ctx, stdout } = setup(["top_rated"]);
		await movieCommand.run(ctx);
		expect(stdout).toEqual(["No top rated movies found."]);
	});

	it("rejects list-only flags in details mode", async () => {
		const { ctx, details } = setup(["550"], { page: "2" });
		await expect(movieCommand.run(ctx)).rejects.toThrow("--page only applies to lists");
		expect(details).not.toHaveBeenCalled();
	});

	it("rejects unknown list names and invalid regions before calling the API", async () => {
		const unknown = setup(["trending"]);
		await expect(movieCommand.run(unknown.ctx)).rejects.toThrow(CliUsageError);
		const region = setup(["popular"], { region: "ITA" });
		await expect(movieCommand.run(region.ctx)).rejects.toThrow(CliUsageError);
		expect(region.movie_lists.popular).not.toHaveBeenCalled();
	});
});

describe("tmdb tv <list>", () => {
	it.each(["airing_today", "on_the_air", "popular", "top_rated"] as const)("routes %s to tv_lists.%s", async (list) => {
		const { ctx, tv_lists, details } = setup([list], { page: "3" });
		await tvCommand.run(ctx);
		expect(tv_lists[list]).toHaveBeenCalledWith({ page: 3 });
		expect(details).not.toHaveBeenCalled();
	});

	it("renders the results table", async () => {
		const { ctx, stdout } = setup(["top-rated"]);
		await tvCommand.run(ctx);
		expect(stdout[0]).toContain("1396  tv    Breaking Bad  2008     8.9");
	});

	it("rejects --page in details mode", async () => {
		const { ctx } = setup(["1396"], { page: "2" });
		await expect(tvCommand.run(ctx)).rejects.toThrow("--page only applies to lists, e.g. `tmdb tv popular --page 2`.");
	});
});
