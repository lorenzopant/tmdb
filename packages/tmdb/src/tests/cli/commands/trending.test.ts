import { describe, expect, it, vi } from "vitest";

import { CliUsageError } from "../../../cli/command";
import { trendingCommand } from "../../../cli/commands/trending";
import { createContext, createIO, fakeClient } from "../helpers";

const page = <T>(results: T[]) => ({ page: 1, total_pages: 1, total_results: results.length, results });
const movie = { id: 27205, title: "Inception", release_date: "2010-07-15", vote_average: 8.4, vote_count: 100 };

function setup(positionals: string[], flags: Record<string, string | boolean> = {}) {
	const trending = {
		all: vi.fn().mockResolvedValue(page([{ ...movie, media_type: "movie" }])),
		movies: vi.fn().mockResolvedValue(page([movie])),
		tv: vi.fn().mockResolvedValue(page([])),
		people: vi.fn().mockResolvedValue(page([])),
	};
	const { io, stdout } = createIO();
	const ctx = createContext({ positionals, flags, io, getClient: fakeClient({ trending }) });
	return { ctx, trending, stdout };
}

describe("tmdb trending", () => {
	it("defaults to all media for today", async () => {
		const { ctx, trending, stdout } = setup([]);
		await trendingCommand.run(ctx);
		expect(trending.all).toHaveBeenCalledWith({ time_window: "day", page: undefined });
		expect(stdout[0]).toContain("27205  movie  Inception");
	});

	it.each([
		["movie", "movies"],
		["tv", "tv"],
		["person", "people"],
	] as const)("routes %s to trending.%s with --week and --page", async (type, method) => {
		const { ctx, trending } = setup([type], { week: true, page: "2" });
		await trendingCommand.run(ctx);
		expect(trending[method]).toHaveBeenCalledWith({ time_window: "week", page: 2 });
	});

	it("prints a friendly message for empty results", async () => {
		const { ctx, stdout } = setup(["tv"]);
		await trendingCommand.run(ctx);
		expect(stdout).toEqual(["Nothing is trending right now."]);
	});

	it.each([[["film"]], [["movie", "extra"]]])("rejects %j before calling the API", async (positionals) => {
		const { ctx, trending } = setup(positionals);
		await expect(trendingCommand.run(ctx)).rejects.toThrow(CliUsageError);
		expect(trending.all).not.toHaveBeenCalled();
	});
});
