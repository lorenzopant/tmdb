import { describe, expect, it, vi } from "vitest";

import { CliUsageError } from "../../../cli/command";
import { discoverCommand } from "../../../cli/commands/discover";
import { createContext, createIO, fakeClient } from "../helpers";

const page = <T>(results: T[]) => ({ page: 1, total_pages: 1, total_results: results.length, results });

const MOVIE_GENRES = {
	genres: [
		{ id: 28, name: "Action" },
		{ id: 35, name: "Comedy" },
		{ id: 878, name: "Science Fiction" },
	],
};
const TV_GENRES = {
	genres: [
		{ id: 18, name: "Drama" },
		{ id: 80, name: "Crime" },
	],
};

function setup(positionals: string[], flags: Record<string, string | boolean> = {}) {
	const discover = {
		movie: vi
			.fn()
			.mockResolvedValue(
				page([{ id: 157336, title: "Interstellar", release_date: "2014-11-05", vote_average: 8.5, vote_count: 38000 }]),
			),
		tv: vi
			.fn()
			.mockResolvedValue(
				page([{ id: 1396, name: "Breaking Bad", first_air_date: "2008-01-20", vote_average: 8.9, vote_count: 18000 }]),
			),
	};
	const genres = { movie_list: vi.fn().mockResolvedValue(MOVIE_GENRES), tv_list: vi.fn().mockResolvedValue(TV_GENRES) };
	const { io, stdout } = createIO();
	const ctx = createContext({ positionals, flags, io, getClient: fakeClient({ discover, genres }) });
	return { ctx, discover, genres, stdout };
}

describe("tmdb discover", () => {
	it("defaults to popularity descending with no filters", async () => {
		const { ctx, discover, genres, stdout } = setup(["movie"]);
		await discoverCommand.run(ctx);
		expect(discover.movie).toHaveBeenCalledWith({ sort_by: "popularity.desc" });
		expect(genres.movie_list).not.toHaveBeenCalled();
		expect(stdout[0]).toContain("157336  movie  Interstellar");
	});

	it("maps movie flags onto the query builder", async () => {
		const { ctx, discover, genres } = setup(["movie"], {
			genre: "science fiction,Action",
			year: "2014",
			"min-rating": "7.5",
			"min-votes": "1000",
			sort: "date",
			asc: true,
			page: "3",
		});
		await discoverCommand.run(ctx);
		expect(genres.movie_list).toHaveBeenCalledWith({ language: "en-US" });
		expect(discover.movie).toHaveBeenCalledWith({
			with_genres: "878,28",
			primary_release_year: 2014,
			"vote_average.gte": 7.5,
			"vote_count.gte": 1000,
			sort_by: "primary_release_date.asc",
			page: 3,
		});
	});

	it("maps tv flags, OR genres and tv-specific sort fields", async () => {
		const { ctx, discover, genres } = setup(["tv"], { genre: "drama|crime", year: "2008", sort: "title" });
		await discoverCommand.run(ctx);
		expect(genres.tv_list).toHaveBeenCalledWith({ language: "en-US" });
		expect(discover.tv).toHaveBeenCalledWith({ with_genres: "18|80", first_air_date_year: 2008, sort_by: "name.desc" });
	});

	it("uses numeric genre ids without fetching the genre list", async () => {
		const { ctx, discover, genres } = setup(["movie"], { genre: "878" });
		await discoverCommand.run(ctx);
		expect(genres.movie_list).not.toHaveBeenCalled();
		expect(discover.movie).toHaveBeenCalledWith(expect.objectContaining({ with_genres: "878" }));
	});

	it("applies a default minimum vote count when sorting by rating", async () => {
		const { ctx, discover } = setup(["movie"], { sort: "rating" });
		await discoverCommand.run(ctx);
		expect(discover.movie).toHaveBeenCalledWith({ "vote_count.gte": 200, sort_by: "vote_average.desc" });
	});

	it("lets --min-votes override the rating-sort default", async () => {
		const { ctx, discover } = setup(["movie"], { sort: "rating", "min-votes": "0" });
		await discoverCommand.run(ctx);
		expect(discover.movie).toHaveBeenCalledWith({ "vote_count.gte": 0, sort_by: "vote_average.desc" });
	});

	it("lists available genres when a name is unknown", async () => {
		const { ctx, discover } = setup(["movie"], { genre: "commedia" });
		await expect(discoverCommand.run(ctx)).rejects.toThrow(
			/Unknown movie genre "commedia". Available: action, comedy, science fiction/,
		);
		expect(discover.movie).not.toHaveBeenCalled();
	});

	it.each([
		[[], {}],
		[["film"], {}],
		[["movie", "extra"], {}],
		[["tv"], { sort: "revenue" }],
		[["movie"], { sort: "nope" }],
		[["movie"], { year: "14" }],
		[["movie"], { "min-rating": "11" }],
		[["movie"], { "min-votes": "-1" }],
		[["movie"], { genre: "action,comedy|drama" }],
		[["movie"], { genre: " , " }],
		[["movie"], { page: "0" }],
	])("rejects %j %j before calling the API", async (positionals, flags) => {
		const { ctx, discover, genres } = setup(positionals as string[], flags as Record<string, string>);
		await expect(discoverCommand.run(ctx)).rejects.toThrow(CliUsageError);
		expect(genres.movie_list).not.toHaveBeenCalled();
		expect(discover.movie).not.toHaveBeenCalled();
		expect(discover.tv).not.toHaveBeenCalled();
	});
});
