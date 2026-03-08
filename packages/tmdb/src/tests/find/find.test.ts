import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { FindAPI } from "../../endpoints/find";

describe("FindAPI", () => {
	let clientMock: ApiClient;
	let findAPI: FindAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		findAPI = new FindAPI(clientMock, { language: "en-US" });
	});

	it("should call client.request with the correct find parameters", async () => {
		await findAPI.by_id({
			external_id: "tt0137523",
			external_source: "imdb_id",
			language: "it-IT",
		});

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/find/tt0137523", {
			external_id: "tt0137523",
			external_source: "imdb_id",
			language: "it-IT",
		});
	});

	it("should apply the default language when none is provided", async () => {
		await findAPI.by_id({
			external_id: "tt0137523",
			external_source: "imdb_id",
		});

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/find/tt0137523", {
			external_id: "tt0137523",
			external_source: "imdb_id",
			language: "en-US",
		});
	});

	it("should keep the default language when it is explicitly undefined", async () => {
		await findAPI.by_id({
			external_id: "tt0137523",
			external_source: "imdb_id",
			language: undefined,
		});

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/find/tt0137523", {
			external_id: "tt0137523",
			external_source: "imdb_id",
			language: "en-US",
		});
	});

	it("should return the result from client.request", async () => {
		const fakeResponse = {
			movie_results: [{ id: 550, media_type: "movie", title: "Fight Club" }],
			person_results: [],
			tv_results: [],
			tv_episode_results: [],
			tv_season_results: [],
		};
		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);

		const result = await findAPI.by_id({
			external_id: "tt0137523",
			external_source: "imdb_id",
		});

		expect(result).toEqual(fakeResponse);
	});
});
