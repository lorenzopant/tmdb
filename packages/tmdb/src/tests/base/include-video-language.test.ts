import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { MoviesAPI } from "../../endpoints/movies";
import { TVEpisodesAPI } from "../../endpoints/tv_episodes";
import { TVSeasonsAPI } from "../../endpoints/tv_seasons";
import { TVSeriesAPI } from "../../endpoints/tv_series";
import { TMDBOptions } from "../../types/config";

/**
 * TMDB returns only videos tagged with the request `language` unless `include_video_language`
 * widens the set. `videos.include_video_language` in the client options injects it into every
 * videos() call and into details() calls that append a videos block.
 */
describe("videos.include_video_language option", () => {
	let clientMock: ApiClient;

	const options: TMDBOptions = { language: "it-IT", videos: { include_video_language: ["it", "en", "null"] } };
	const params = (index = 0) => (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[index][1];

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
	});

	describe("videos() endpoints", () => {
		it("movies.videos", async () => {
			await new MoviesAPI(clientMock, options).videos({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/videos", {
				language: "it-IT",
				include_video_language: "it,en,null",
			});
		});

		it("tv_series.videos", async () => {
			await new TVSeriesAPI(clientMock, options).videos({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/videos", {
				language: "it-IT",
				include_video_language: "it,en,null",
			});
		});

		it("tv_seasons.videos", async () => {
			await new TVSeasonsAPI(clientMock, options).videos({ series_id: 1396, season_number: 1 });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/videos", {
				language: "it-IT",
				include_video_language: "it,en,null",
			});
		});

		it("tv_episodes.videos", async () => {
			await new TVEpisodesAPI(clientMock, options).videos({ series_id: 1396, season_number: 1, episode_number: 1 });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1/videos", {
				language: "it-IT",
				include_video_language: "it,en,null",
			});
		});

		it("lets an explicit call-site value win", async () => {
			await new MoviesAPI(clientMock, options).videos({ movie_id: 550, include_video_language: "fr" });
			expect(params().include_video_language).toBe("fr");
		});

		it("dedupes repeated codes", async () => {
			await new MoviesAPI(clientMock, { videos: { include_video_language: ["en", "en", "null"] } }).videos({ movie_id: 550 });
			expect(params().include_video_language).toBe("en,null");
		});

		it("is not injected when the option is absent or empty", async () => {
			await new MoviesAPI(clientMock).videos({ movie_id: 550 });
			await new MoviesAPI(clientMock, { videos: { include_video_language: [] } }).videos({ movie_id: 550 });
			expect(params(0)).not.toHaveProperty("include_video_language");
			expect(params(1)).not.toHaveProperty("include_video_language");
		});
	});

	describe("details() with append_to_response", () => {
		it("movies.details injects when videos is appended", async () => {
			await new MoviesAPI(clientMock, options).details({ movie_id: 550, append_to_response: ["videos", "credits"] });
			expect(params().include_video_language).toBe("it,en,null");
		});

		it("tv_series.details injects when videos is appended", async () => {
			await new TVSeriesAPI(clientMock, options).details({ series_id: 1396, append_to_response: ["videos"] });
			expect(params().include_video_language).toBe("it,en,null");
		});

		it("tv_seasons.details injects when videos is appended", async () => {
			await new TVSeasonsAPI(clientMock, options).details({ series_id: 1396, season_number: 1, append_to_response: ["videos"] });
			expect(params().include_video_language).toBe("it,en,null");
		});

		it("tv_episodes.details injects when videos is appended", async () => {
			await new TVEpisodesAPI(clientMock, options).details({
				series_id: 1396,
				season_number: 1,
				episode_number: 1,
				append_to_response: ["videos"],
			});
			expect(params().include_video_language).toBe("it,en,null");
		});

		it("injects from a comma-separated append_to_response string", async () => {
			await new MoviesAPI(clientMock, options).details({ movie_id: 550, append_to_response: "credits,videos" as never });
			expect(params().include_video_language).toBe("it,en,null");
		});

		it("is not injected when videos is not appended", async () => {
			await new MoviesAPI(clientMock, options).details({ movie_id: 550, append_to_response: ["credits"] });
			await new MoviesAPI(clientMock, options).details({ movie_id: 550 });
			expect(params(0)).not.toHaveProperty("include_video_language");
			expect(params(1)).not.toHaveProperty("include_video_language");
		});

		it("lets an explicit call-site value win", async () => {
			await new MoviesAPI(clientMock, options).details({
				movie_id: 550,
				append_to_response: ["videos"],
				include_video_language: "fr",
			});
			expect(params().include_video_language).toBe("fr");
		});

		it("works alongside auto_include_image_language", async () => {
			await new MoviesAPI(clientMock, {
				...options,
				images: { auto_include_image_language: true, image_language_priority: { posters: ["it", "null"] } },
			}).details({ movie_id: 550, append_to_response: ["images", "videos"] });
			expect(params().include_video_language).toBe("it,en,null");
			expect(params().include_image_language).toEqual(["it", "null"]);
		});
	});
});
