import { describe, expect, it, vi } from "vitest";

import { CliUsageError } from "../../../cli/command";
import { movieCommand } from "../../../cli/commands/movie";
import { personCommand } from "../../../cli/commands/person";
import { tvCommand } from "../../../cli/commands/tv";
import { createContext, createIO, fakeClient } from "../helpers";

const movie = {
	id: 27205,
	title: "Inception",
	original_title: "Inception",
	release_date: "2010-07-15",
	tagline: "Your mind is the scene of the crime.",
	genres: [{ id: 28, name: "Action" }],
	runtime: 148,
	status: "Released",
	vote_average: 8.369,
	vote_count: 40234,
	overview: "A thief.",
	credits: {
		cast: Array.from({ length: 7 }, (_, i) => ({ name: `Actor ${i}`, character: `Role ${i}` })),
		crew: [
			{ name: "Christopher Nolan", job: "Director" },
			{ name: "Emma Thomas", job: "Producer" },
		],
	},
};

const series = {
	id: 1396,
	name: "Breaking Bad",
	first_air_date: "2008-01-20",
	last_air_date: "2013-09-29",
	status: "Ended",
	genres: [{ id: 18, name: "Drama" }],
	number_of_seasons: 5,
	number_of_episodes: 62,
	vote_average: 8.9,
	vote_count: 18677,
	created_by: [{ name: "Vince Gilligan" }],
	networks: [{ name: "AMC" }],
	overview: "A teacher.",
	aggregate_credits: {
		cast: [
			{ name: "Bryan Cranston", roles: [{ character: "Walter White" }], total_episode_count: 62 },
			{ name: "Unknown", roles: [], total_episode_count: 1 },
		],
	},
};

const credit = (id: number, title: string, vote_count: number, extra: Record<string, unknown>) => ({
	id,
	media_type: "movie",
	title,
	release_date: "2010-01-01",
	vote_count,
	...extra,
});

const director = {
	id: 525,
	name: "Christopher Nolan",
	known_for_department: "Directing",
	birthday: "1970-07-30",
	place_of_birth: "London",
	biography: "Filmmaker.",
	combined_credits: {
		cast: [credit(1, "Cameo", 99999, { character: "Himself" })],
		crew: [
			credit(2, "Inception", 40000, { department: "Production", job: "Producer" }),
			credit(2, "Inception", 40000, { department: "Directing", job: "Director" }),
			credit(3, "Memento", 15000, { department: "Directing", job: "Director" }),
			{
				id: 4,
				media_type: "tv",
				name: "A Show",
				first_air_date: "2020-01-01",
				vote_count: 20000,
				department: "Directing",
				job: "Director",
			},
		],
	},
};

function setup(client: Record<string, unknown>, positionals: string[], json = false, flags: Record<string, string | string[]> = {}) {
	const { io, stdout } = createIO();
	const ctx = createContext({ positionals, flags, json, io, getClient: fakeClient(client) });
	return { ctx, stdout };
}

describe("tmdb movie", () => {
	it("requests plain details by default, without append_to_response", async () => {
		const details = vi.fn().mockResolvedValue(movie);
		await movieCommand.run(setup({ movies: { details } }, ["27205"]).ctx);
		expect(details).toHaveBeenCalledWith({ movie_id: 27205 });
	});

	it("forwards --append values (comma-separated, repeated, dashed) as append_to_response", async () => {
		const details = vi.fn().mockResolvedValue(movie);
		await movieCommand.run(
			setup({ movies: { details } }, ["27205"], false, { append: ["credits,videos", "alternative-titles", "credits"] }).ctx,
		);
		expect(details).toHaveBeenCalledWith({ movie_id: 27205, append_to_response: ["credits", "videos", "alternative_titles"] });
	});

	it("renders no director or cast without credits, and a tip on how to add them", async () => {
		const { credits: _credits, ...plain } = movie;
		const { ctx, stdout } = setup({ movies: { details: vi.fn().mockResolvedValue(plain) } }, ["27205"]);
		await movieCommand.run(ctx);
		expect(stdout[0]).toContain("Inception (2010)");
		expect(stdout[0]).not.toContain("Directed by");
		expect(stdout[0]).not.toContain("Cast");
		expect(stdout[1]).toBe("Tip: --append credits adds the director and cast.");
	});

	it("points to --json for appends the view does not render", async () => {
		const { ctx, stdout } = setup({ movies: { details: vi.fn().mockResolvedValue(movie) } }, ["27205"], false, {
			append: ["credits,videos"],
		});
		await movieCommand.run(ctx);
		expect(stdout[1]).toBe("Also fetched: videos — see them with --json.");
	});

	it("rejects unknown --append values and --append on lists before calling the API", async () => {
		const details = vi.fn();
		const popular = vi.fn();
		const client = { movies: { details }, movie_lists: { popular } };
		await expect(movieCommand.run(setup(client, ["27205"], false, { append: ["creditz"] }).ctx)).rejects.toThrow(
			/Unknown --append value: creditz. Available: alternative_titles/,
		);
		await expect(movieCommand.run(setup(client, ["popular"], false, { append: ["credits"] }).ctx)).rejects.toThrow(
			"--append only applies to details",
		);
		expect(details).not.toHaveBeenCalled();
		expect(popular).not.toHaveBeenCalled();
	});

	it("renders title, tagline, meta, director, top 5 cast and url with credits appended", async () => {
		const { ctx, stdout } = setup({ movies: { details: vi.fn().mockResolvedValue(movie) } }, ["27205"], false, { append: ["credits"] });
		await movieCommand.run(ctx);
		const text = stdout[0] ?? "";
		expect(text).toContain("Inception (2010)\nYour mind is the scene of the crime.\nAction · 2h 28m · ★ 8.4/10 (40,234 votes)");
		expect(text).toContain("Directed by Christopher Nolan");
		expect(text).not.toContain("Emma Thomas");
		expect(text).not.toContain("Original title");
		expect(text).toContain("Actor 4");
		expect(text).not.toContain("Actor 5");
		expect(text).toContain("https://www.themoviedb.org/movie/27205");
	});

	it("prints raw JSON with --json", async () => {
		const { ctx, stdout } = setup({ movies: { details: vi.fn().mockResolvedValue(movie) } }, ["27205"], true);
		await movieCommand.run(ctx);
		expect(JSON.parse(stdout[0] ?? "")).toEqual(movie);
	});

	it("validates the id before calling the API", async () => {
		const details = vi.fn();
		await expect(movieCommand.run(setup({ movies: { details } }, ["abc"]).ctx)).rejects.toThrow(CliUsageError);
		expect(details).not.toHaveBeenCalled();
	});
});

describe("tmdb tv", () => {
	it("requests plain details by default, and forwards --append", async () => {
		const details = vi.fn().mockResolvedValue(series);
		await tvCommand.run(setup({ tv_series: { details } }, ["1396"]).ctx);
		expect(details).toHaveBeenCalledWith({ series_id: 1396 });

		await tvCommand.run(setup({ tv_series: { details } }, ["1396"], false, { append: ["aggregate_credits,content_ratings"] }).ctx);
		expect(details).toHaveBeenLastCalledWith({ series_id: 1396, append_to_response: ["aggregate_credits", "content_ratings"] });
	});

	it("shows no cast and a tip without credits", async () => {
		const { aggregate_credits: _credits, ...plain } = series;
		const { ctx, stdout } = setup({ tv_series: { details: vi.fn().mockResolvedValue(plain) } }, ["1396"]);
		await tvCommand.run(ctx);
		expect(stdout[0]).toContain("Created by Vince Gilligan");
		expect(stdout[0]).not.toContain("Cast");
		expect(stdout[1]).toBe("Tip: --append aggregate_credits adds the cast.");
	});

	it("falls back to latest-season credits when only credits is appended", async () => {
		const { aggregate_credits: _aggregate, ...plain } = series;
		const withCredits = { ...plain, credits: { cast: [{ name: "Bryan Cranston", character: "Walter White" }], crew: [] } };
		const { ctx, stdout } = setup({ tv_series: { details: vi.fn().mockResolvedValue(withCredits) } }, ["1396"], false, {
			append: ["credits"],
		});
		await tvCommand.run(ctx);
		const cast = (stdout[0] ?? "").slice((stdout[0] ?? "").indexOf("Cast"));
		expect(cast).toContain("Cast\n  Bryan Cranston  Walter White");
		expect(cast).not.toContain("episode");
	});

	it("rejects --append on lists", async () => {
		const popular = vi.fn();
		await expect(tvCommand.run(setup({ tv_lists: { popular } }, ["popular"], false, { append: ["credits"] }).ctx)).rejects.toThrow(
			"--append only applies to details",
		);
		expect(popular).not.toHaveBeenCalled();
	});

	it("renders the year range, seasons, creators, networks and cast with episode counts", async () => {
		const { ctx, stdout } = setup({ tv_series: { details: vi.fn().mockResolvedValue(series) } }, ["1396"], false, {
			append: ["aggregate_credits"],
		});
		await tvCommand.run(ctx);
		const text = stdout[0] ?? "";
		expect(text).toContain("Breaking Bad (2008–2013)");
		expect(text).toContain("Drama · 5 seasons, 62 episodes · ★ 8.9/10 (18,677 votes)");
		expect(text).toContain("Created by Vince Gilligan\nNetworks AMC\nStatus Ended");
		expect(text).toContain("Bryan Cranston  Walter White · 62 episodes");
		expect(text).toContain("Unknown         — · 1 episode");
	});

	it("shows an open year range for running series", async () => {
		const running = { ...series, status: "Returning Series" };
		const { ctx, stdout } = setup({ tv_series: { details: vi.fn().mockResolvedValue(running) } }, ["1396"]);
		await tvCommand.run(ctx);
		expect(stdout[0]).toContain("Breaking Bad (2008–)");
	});
});

describe("tmdb person", () => {
	it("requests plain details by default, and forwards --append", async () => {
		const details = vi.fn().mockResolvedValue(director);
		await personCommand.run(setup({ people: { details } }, ["525"]).ctx);
		expect(details).toHaveBeenCalledWith({ person_id: 525 });

		await personCommand.run(setup({ people: { details } }, ["525"], false, { append: ["combined_credits", "external_ids"] }).ctx);
		expect(details).toHaveBeenLastCalledWith({ person_id: 525, append_to_response: ["combined_credits", "external_ids"] });
	});

	it("shows no known-for list and a tip without combined credits", async () => {
		const { combined_credits: _credits, ...plain } = director;
		const { ctx, stdout } = setup({ people: { details: vi.fn().mockResolvedValue(plain) } }, ["525"]);
		await personCommand.run(ctx);
		expect(stdout[0]).toContain("Christopher Nolan");
		expect(stdout[0]).not.toContain("Known for");
		expect(stdout[1]).toBe("Tip: --append combined_credits adds their best-known credits.");
	});

	it("rejects unknown --append values before calling the API", async () => {
		const details = vi.fn();
		await expect(personCommand.run(setup({ people: { details } }, ["525"], false, { append: ["credits"] }).ctx)).rejects.toThrow(
			/Unknown --append value: credits. Available: changes, combined_credits/,
		);
		expect(details).not.toHaveBeenCalled();
	});

	it("lists own-department crew credits for non-actors, deduplicated and ranked by votes", async () => {
		const { ctx, stdout } = setup({ people: { details: vi.fn().mockResolvedValue(director) } }, ["525"]);
		await personCommand.run(ctx);
		const text = stdout[0] ?? "";
		expect(text).toContain("Christopher Nolan\nDirecting · Born 1970-07-30\nBorn in London");
		const knownFor = text.slice(text.indexOf("Known for"));
		expect(knownFor).toContain("Inception (2010)  Director · movie");
		expect(knownFor).not.toContain("Producer");
		expect(knownFor).not.toContain("Cameo");
		expect(knownFor.indexOf("Inception")).toBeLessThan(knownFor.indexOf("A Show"));
		expect(knownFor.indexOf("A Show")).toBeLessThan(knownFor.indexOf("Memento"));
		expect(knownFor).toContain("A Show (2020)");
	});

	it("lists cast credits for actors", async () => {
		const actor = { ...director, known_for_department: "Acting" };
		const { ctx, stdout } = setup({ people: { details: vi.fn().mockResolvedValue(actor) } }, ["525"]);
		await personCommand.run(ctx);
		expect(stdout[0]).toContain("Cameo (2010)  Himself · movie");
	});

	it("shows the lifespan for deceased people and truncates long biographies", async () => {
		const late = { ...director, deathday: "2020-01-01", biography: "word ".repeat(300) };
		const { ctx, stdout } = setup({ people: { details: vi.fn().mockResolvedValue(late) } }, ["525"]);
		await personCommand.run(ctx);
		expect(stdout[0]).toContain("Directing · 1970-07-30 – 2020-01-01");
		expect(stdout[0]).toContain("word…");
	});
});
