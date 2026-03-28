import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { TVEpisodesAPI } from "../../endpoints/tv_episodes";

const BASE_EPISODE_PARAMS = { series_id: 1396, season_number: 1, episode_number: 1 };

describe("TVEpisodesAPI", () => {
	let clientMock: ApiClient;
	let tvEpisodesAPI: TVEpisodesAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		tvEpisodesAPI = new TVEpisodesAPI(clientMock);
	});

	describe("details", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await tvEpisodesAPI.details({ ...BASE_EPISODE_PARAMS, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1", {
				language: "en-US",
				append_to_response: undefined,
			});
		});

		it("should pass append_to_response when specified", async () => {
			await tvEpisodesAPI.details({ ...BASE_EPISODE_PARAMS, append_to_response: ["credits", "images"] });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1", {
				language: undefined,
				append_to_response: ["credits", "images"],
			});
		});

		it("should use defaultOptions.language when no language is provided", async () => {
			tvEpisodesAPI = new TVEpisodesAPI(clientMock, { language: "it-IT" });
			await tvEpisodesAPI.details(BASE_EPISODE_PARAMS);
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1", {
				language: "it-IT",
				append_to_response: undefined,
			});
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { id: 62085, name: "Pilot" };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await tvEpisodesAPI.details(BASE_EPISODE_PARAMS);
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("changes", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await tvEpisodesAPI.changes({ episode_id: 62085 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/episode/62085/changes");
		});
	});

	describe("credits", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await tvEpisodesAPI.credits({ ...BASE_EPISODE_PARAMS, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1/credits", { language: "en-US" });
		});

		it("should use defaultOptions.language when not specified", async () => {
			tvEpisodesAPI = new TVEpisodesAPI(clientMock, { language: "fr-FR" });
			await tvEpisodesAPI.credits(BASE_EPISODE_PARAMS);
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1/credits", { language: "fr-FR" });
		});
	});

	describe("external_ids", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvEpisodesAPI.external_ids(BASE_EPISODE_PARAMS);
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1/external_ids");
		});
	});

	describe("images", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await tvEpisodesAPI.images({ ...BASE_EPISODE_PARAMS, language: "en-US", include_image_language: ["en", "null"] });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1/images", {
				language: "en-US",
				include_image_language: ["en", "null"],
			});
		});

		it("should use defaultOptions.language when not specified", async () => {
			tvEpisodesAPI = new TVEpisodesAPI(clientMock, { language: "de-DE" });
			await tvEpisodesAPI.images(BASE_EPISODE_PARAMS);
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1/images", {
				language: "de-DE",
				include_image_language: undefined,
			});
		});
	});

	describe("translations", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvEpisodesAPI.translations(BASE_EPISODE_PARAMS);
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1/translations");
		});
	});

	describe("videos", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvEpisodesAPI.videos(BASE_EPISODE_PARAMS);
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/episode/1/videos");
		});
	});
});
