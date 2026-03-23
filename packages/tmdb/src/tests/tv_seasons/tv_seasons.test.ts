import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { TVSeasonsAPI } from "../../endpoints/tv_seasons";

const BASE_SEASON_PARAMS = { series_id: 1396, season_number: 1 };

describe("TVSeasonsAPI", () => {
	let clientMock: ApiClient;
	let tvSeasonsAPI: TVSeasonsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		tvSeasonsAPI = new TVSeasonsAPI(clientMock);
	});

	describe("details", () => {
		it("should call client.request with correct endpoint and language", async () => {
			await tvSeasonsAPI.details({ ...BASE_SEASON_PARAMS, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1", {
				language: "en-US",
				append_to_response: undefined,
			});
		});

		it("should pass append_to_response when specified", async () => {
			await tvSeasonsAPI.details({ ...BASE_SEASON_PARAMS, append_to_response: ["credits"] });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1", {
				language: undefined,
				append_to_response: ["credits"],
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			tvSeasonsAPI = new TVSeasonsAPI(clientMock, { language: "it-IT" });
			await tvSeasonsAPI.details(BASE_SEASON_PARAMS);
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1", {
				language: "it-IT",
				append_to_response: undefined,
			});
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { id: 3572, season_number: 1, episodes: [] };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await tvSeasonsAPI.details(BASE_SEASON_PARAMS);
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("aggregate_credits", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await tvSeasonsAPI.aggregate_credits({ ...BASE_SEASON_PARAMS, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/aggregate_credits", { language: "en-US" });
		});

		it("should use defaultOptions.language when not provided", async () => {
			tvSeasonsAPI = new TVSeasonsAPI(clientMock, { language: "fr-FR" });
			await tvSeasonsAPI.aggregate_credits(BASE_SEASON_PARAMS);
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/aggregate_credits", { language: "fr-FR" });
		});
	});

	describe("changes", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await tvSeasonsAPI.changes({ season_id: 3572, start_date: "2024-01-01", end_date: "2024-01-14" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/season/3572/changes", {
				start_date: "2024-01-01",
				end_date: "2024-01-14",
			});
		});
	});

	describe("credits", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await tvSeasonsAPI.credits({ ...BASE_SEASON_PARAMS, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/credits", { language: "en-US" });
		});

		it("should use defaultOptions.language when not provided", async () => {
			tvSeasonsAPI = new TVSeasonsAPI(clientMock, { language: "de-DE" });
			await tvSeasonsAPI.credits(BASE_SEASON_PARAMS);
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/credits", { language: "de-DE" });
		});
	});

	describe("external_ids", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeasonsAPI.external_ids(BASE_SEASON_PARAMS);
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/external_ids");
		});
	});

	describe("images", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await tvSeasonsAPI.images({ ...BASE_SEASON_PARAMS, language: "en-US", include_image_language: ["en", "null"] });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/images", {
				language: "en-US",
				include_image_language: ["en", "null"],
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			tvSeasonsAPI = new TVSeasonsAPI(clientMock, { language: "es-ES" });
			await tvSeasonsAPI.images(BASE_SEASON_PARAMS);
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/images", {
				language: "es-ES",
				include_image_language: undefined,
			});
		});
	});

	describe("translations", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeasonsAPI.translations(BASE_SEASON_PARAMS);
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/translations");
		});
	});

	describe("videos", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await tvSeasonsAPI.videos({ ...BASE_SEASON_PARAMS, language: "en-US", include_video_language: "en" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/videos", {
				language: "en-US",
				include_video_language: "en",
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			tvSeasonsAPI = new TVSeasonsAPI(clientMock, { language: "pt-BR" });
			await tvSeasonsAPI.videos(BASE_SEASON_PARAMS);
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/videos", {
				language: "pt-BR",
				include_video_language: undefined,
			});
		});
	});

	describe("watch_providers", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await tvSeasonsAPI.watch_providers({ ...BASE_SEASON_PARAMS, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/watch/providers", { language: "en-US" });
		});

		it("should use defaultOptions.language when not provided", async () => {
			tvSeasonsAPI = new TVSeasonsAPI(clientMock, { language: "ko-KR" });
			await tvSeasonsAPI.watch_providers(BASE_SEASON_PARAMS);
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/season/1/watch/providers", { language: "ko-KR" });
		});
	});
});
