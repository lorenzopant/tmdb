import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { MoviesAPI } from "../../endpoints/movies";
import { PeopleAPI } from "../../endpoints/people";
import { TVEpisodesAPI } from "../../endpoints/tv_episodes";
import { TVSeasonsAPI } from "../../endpoints/tv_seasons";
import { TVSeriesAPI } from "../../endpoints/tv_series";
import { TMDBOptions } from "../../types/config";

/**
 * `include_image_language` is required to get logos, untagged backdrops or textless
 * posters out of an appended `images` block — `language` alone filters the block down
 * to that language's tagged images. It used to be destructured away by the details()
 * methods, so the value never reached the query string and the failure was silent.
 */
describe("include_image_language on details() with append_to_response", () => {
	let clientMock: ApiClient;

	const params = (index = 0) => (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[index][1];

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
	});

	describe("explicit call-site value is forwarded", () => {
		const include_image_language = ["null", "en"] as const;

		it("movies.details", async () => {
			await new MoviesAPI(clientMock).details({
				movie_id: 550,
				language: "it-IT",
				append_to_response: ["images"],
				include_image_language: [...include_image_language],
			});
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550", {
				language: "it-IT",
				append_to_response: ["images"],
				include_image_language: ["null", "en"],
			});
		});

		it("tv_series.details", async () => {
			await new TVSeriesAPI(clientMock).details({
				series_id: 1396,
				language: "it-IT",
				append_to_response: ["images"],
				include_image_language: [...include_image_language],
			});
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396", {
				language: "it-IT",
				append_to_response: ["images"],
				include_image_language: ["null", "en"],
			});
		});

		it("tv_seasons.details", async () => {
			await new TVSeasonsAPI(clientMock).details({
				series_id: 1396,
				season_number: 1,
				language: "it-IT",
				append_to_response: ["images"],
				include_image_language: [...include_image_language],
			});
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1", {
				language: "it-IT",
				append_to_response: ["images"],
				include_image_language: ["null", "en"],
			});
		});

		it("tv_episodes.details", async () => {
			await new TVEpisodesAPI(clientMock).details({
				series_id: 1396,
				season_number: 1,
				episode_number: 1,
				language: "it-IT",
				append_to_response: ["images"],
				include_image_language: [...include_image_language],
			});
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1", {
				language: "it-IT",
				append_to_response: ["images"],
				include_image_language: ["null", "en"],
			});
		});
	});

	describe("path params never leak into the query string", () => {
		it("tv_seasons.details keeps series_id and season_number in the path only", async () => {
			await new TVSeasonsAPI(clientMock).details({ series_id: 1396, season_number: 1 });
			expect(params()).not.toHaveProperty("series_id");
			expect(params()).not.toHaveProperty("season_number");
		});

		it("tv_episodes.details keeps all three path params in the path only", async () => {
			await new TVEpisodesAPI(clientMock).details({ series_id: 1396, season_number: 1, episode_number: 1 });
			expect(params()).not.toHaveProperty("series_id");
			expect(params()).not.toHaveProperty("season_number");
			expect(params()).not.toHaveProperty("episode_number");
		});

		it("movies.details keeps movie_id in the path only", async () => {
			await new MoviesAPI(clientMock).details({ movie_id: 550 });
			expect(params()).not.toHaveProperty("movie_id");
		});
	});

	describe("auto_include_image_language", () => {
		const options: TMDBOptions = {
			images: {
				auto_include_image_language: true,
				image_language_priority: { posters: ["it", "null", "*"], backdrops: ["en"] },
			},
		};

		it("is derived for a details call that appends images", async () => {
			await new MoviesAPI(clientMock, options).details({
				movie_id: 550,
				append_to_response: ["images", "credits"],
			});
			expect(params().include_image_language).toEqual(expect.arrayContaining(["it", "null", "en"]));
			expect(params().include_image_language).not.toContain("*");
		});

		it("is derived when append_to_response is the bare string form", async () => {
			await new MoviesAPI(clientMock, options).details({ movie_id: 550, append_to_response: "images" });
			expect(params().include_image_language).toEqual(expect.arrayContaining(["it", "null", "en"]));
		});

		// TMDB accepts append_to_response as a comma-separated list and the endpoint JSDoc
		// documents it that way, so a joined string has to behave like the array form.
		// The param types only allow single namespaces or arrays of them, so reaching this
		// path takes a cast — but JS consumers and `as never` escape hatches do it, and it
		// used to silently skip the injection.
		describe("comma-separated append_to_response", () => {
			it("is derived from a joined string", async () => {
				await new MoviesAPI(clientMock, options).details({
					movie_id: 550,
					append_to_response: "credits,images" as never,
				});
				expect(params().include_image_language).toEqual(expect.arrayContaining(["it", "null", "en"]));
			});

			it("tolerates whitespace around the entries", async () => {
				await new MoviesAPI(clientMock, options).details({
					movie_id: 550,
					append_to_response: " credits , images " as never,
				});
				expect(params().include_image_language).toEqual(expect.arrayContaining(["it", "null", "en"]));
			});

			it("is derived from an array holding a joined string", async () => {
				await new MoviesAPI(clientMock, options).details({
					movie_id: 550,
					append_to_response: ["credits,images"] as never,
				});
				expect(params().include_image_language).toEqual(expect.arrayContaining(["it", "null", "en"]));
			});

			it("is not derived when the joined string has no images entry", async () => {
				await new MoviesAPI(clientMock, options).details({
					movie_id: 550,
					append_to_response: "credits,videos" as never,
				});
				expect(params().include_image_language).toBeUndefined();
			});

			it("does not match a namespace that merely contains 'images'", async () => {
				await new MoviesAPI(clientMock, options).details({
					movie_id: 550,
					append_to_response: "images_extra,credits" as never,
				});
				expect(params().include_image_language).toBeUndefined();
			});

			it("forwards the joined string to the client untouched", async () => {
				await new MoviesAPI(clientMock, options).details({
					movie_id: 550,
					append_to_response: "credits,images" as never,
				});
				expect(params().append_to_response).toBe("credits,images");
			});
		});

		it("is not derived when the call does not append images", async () => {
			await new MoviesAPI(clientMock, options).details({ movie_id: 550, append_to_response: ["credits"] });
			expect(params().include_image_language).toBeUndefined();
		});

		it("is not derived when there is no append_to_response at all", async () => {
			await new MoviesAPI(clientMock, options).details({ movie_id: 550 });
			expect(params().include_image_language).toBeUndefined();
		});

		it("does not override an explicit call-site value", async () => {
			await new MoviesAPI(clientMock, options).details({
				movie_id: 550,
				append_to_response: ["images"],
				include_image_language: ["fr", "null"],
			});
			expect(params().include_image_language).toEqual(["fr", "null"]);
		});

		it("applies to tv, season and episode details too", async () => {
			await new TVSeriesAPI(clientMock, options).details({ series_id: 1396, append_to_response: ["images"] });
			await new TVSeasonsAPI(clientMock, options).details({
				series_id: 1396,
				season_number: 1,
				append_to_response: ["images"],
			});
			await new TVEpisodesAPI(clientMock, options).details({
				series_id: 1396,
				season_number: 1,
				episode_number: 1,
				append_to_response: ["images"],
			});
			for (const index of [0, 1, 2]) {
				expect(params(index).include_image_language).toEqual(expect.arrayContaining(["it", "null", "en"]));
			}
		});

		it("is not derived for people.details — TMDB profile images carry no language tag", async () => {
			await new PeopleAPI(clientMock, options).details({ person_id: 287, append_to_response: ["images"] });
			expect(params().include_image_language).toBeUndefined();
		});
	});
});

describe("include_image_language reaches the request URL", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: { get: () => null },
			json: async () => ({}),
		});
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	const calledUrl = () => (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;

	it("serializes the array as a comma-separated list", async () => {
		// `test_api_key_v3` is a mock — fetch is stubbed, so no real credential is involved.
		await new MoviesAPI("test_api_key_v3").details({
			movie_id: 550,
			language: "it-IT",
			append_to_response: ["images"],
			include_image_language: ["null", "en"],
		});
		expect(decodeURIComponent(calledUrl())).toContain("include_image_language=null,en");
	});

	it("omits the param entirely when it is not given", async () => {
		await new MoviesAPI("test_api_key_v3").details({
			movie_id: 550,
			language: "it-IT",
			append_to_response: ["images"],
		});
		expect(calledUrl()).not.toContain("include_image_language");
	});
});
