import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { TVSeriesAPI } from "../../endpoints/tv_series";

describe("TVSeriesAPI", () => {
	let clientMock: ApiClient;
	let tvSeriesAPI: TVSeriesAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		tvSeriesAPI = new TVSeriesAPI(clientMock);
	});

	describe("details", () => {
		it("should call client.request with correct endpoint and language", async () => {
			await tvSeriesAPI.details({ series_id: 1396, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396", { language: "en-US" });
		});

		it("should pass append_to_response when specified", async () => {
			await tvSeriesAPI.details({ series_id: 1396, append_to_response: ["credits", "images"] });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396", {
				language: undefined,
				append_to_response: ["credits", "images"],
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			tvSeriesAPI = new TVSeriesAPI(clientMock, { language: "it-IT" });
			await tvSeriesAPI.details({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396", expect.objectContaining({ language: "it-IT" }));
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { id: 1396, name: "Breaking Bad" };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await tvSeriesAPI.details({ series_id: 1396 });
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("aggregate_credits", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await tvSeriesAPI.aggregate_credits({ series_id: 1396, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/aggregate_credits", { language: "en-US" });
		});

		it("should use defaultOptions.language when not provided", async () => {
			tvSeriesAPI = new TVSeriesAPI(clientMock, { language: "de-DE" });
			await tvSeriesAPI.aggregate_credits({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/aggregate_credits", { language: "de-DE" });
		});
	});

	describe("alternative_titles", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeriesAPI.alternative_titles({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/alternative_titles");
		});
	});

	describe("changes", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await tvSeriesAPI.changes({ series_id: 1396, start_date: "2024-01-01", end_date: "2024-01-14" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/changes", {
				start_date: "2024-01-01",
				end_date: "2024-01-14",
			});
		});
	});

	describe("content_ratings", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeriesAPI.content_ratings({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/content_ratings");
		});
	});

	describe("credits", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await tvSeriesAPI.credits({ series_id: 1396, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/credits", { language: "en-US" });
		});

		it("should use defaultOptions.language when not provided", async () => {
			tvSeriesAPI = new TVSeriesAPI(clientMock, { language: "fr-FR" });
			await tvSeriesAPI.credits({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/credits", { language: "fr-FR" });
		});
	});

	describe("episode_groups", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeriesAPI.episode_groups({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/episode_groups");
		});
	});

	describe("external_ids", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeriesAPI.external_ids({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/external_ids");
		});
	});

	describe("images", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await tvSeriesAPI.images({ series_id: 1396, language: "en-US", include_image_language: "en,null" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/images", {
				language: "en-US",
				include_image_language: "en,null",
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			tvSeriesAPI = new TVSeriesAPI(clientMock, { language: "es-ES" });
			await tvSeriesAPI.images({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/images", { language: "es-ES" });
		});
	});

	describe("keywords", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeriesAPI.keywords({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/keywords");
		});
	});

	describe("latest", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeriesAPI.latest();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/latest");
		});
	});

	describe("lists", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await tvSeriesAPI.lists({ series_id: 1396, language: "en-US", page: 2 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/lists", { language: "en-US", page: 2 });
		});

		it("should use defaultOptions.language when not provided", async () => {
			tvSeriesAPI = new TVSeriesAPI(clientMock, { language: "it-IT" });
			await tvSeriesAPI.lists({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/lists", { language: "it-IT" });
		});
	});

	describe("recommendations", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await tvSeriesAPI.recommendations({ series_id: 1396, language: "en-US", page: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/recommendations", { language: "en-US", page: 1 });
		});
	});

	describe("reviews", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await tvSeriesAPI.reviews({ series_id: 1396, language: "en-US", page: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/reviews", { language: "en-US", page: 1 });
		});
	});

	describe("screened_theatrically", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeriesAPI.screened_theatrically({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/screened_theatrically");
		});
	});

	describe("similar", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await tvSeriesAPI.similar({ series_id: 1396, language: "en-US", page: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/similar", { language: "en-US", page: 1 });
		});
	});

	describe("translations", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeriesAPI.translations({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/translations");
		});
	});

	describe("videos", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeriesAPI.videos({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/videos");
		});
	});

	describe("watch_providers", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvSeriesAPI.watch_providers({ series_id: 1396 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/1396/watch/providers");
		});
	});
});
