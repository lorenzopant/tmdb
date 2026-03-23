import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { TVSeriesListsAPI } from "../../endpoints/tv_series_lists";

describe("TVSeriesListsAPI", () => {
	let clientMock: ApiClient;
	let tvSeriesListsAPI: TVSeriesListsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		tvSeriesListsAPI = new TVSeriesListsAPI(clientMock, { language: "en-US", timezone: "America/New_York" });
	});

	describe("airing_today", () => {
		it("should call client.request with the correct endpoint and default options", async () => {
			await tvSeriesListsAPI.airing_today();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/airing_today", {
				language: "en-US",
				timezone: "America/New_York",
			});
		});

		it("should merge explicit params with default options", async () => {
			await tvSeriesListsAPI.airing_today({ page: 2, timezone: "Pacific/Auckland" });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/airing_today", {
				language: "en-US",
				timezone: "Pacific/Auckland",
				page: 2,
			});
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { page: 1, results: [], total_pages: 1, total_results: 0 };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await tvSeriesListsAPI.airing_today();
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("on_the_air", () => {
		it("should call client.request with the correct endpoint and default options", async () => {
			await tvSeriesListsAPI.on_the_air();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/on_the_air", {
				language: "en-US",
				timezone: "America/New_York",
			});
		});

		it("should merge explicit params with default options", async () => {
			await tvSeriesListsAPI.on_the_air({ page: 3, language: "it-IT" });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/on_the_air", {
				language: "it-IT",
				timezone: "America/New_York",
				page: 3,
			});
		});
	});

	describe("popular", () => {
		it("should call client.request with the correct endpoint and default options", async () => {
			await tvSeriesListsAPI.popular();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/popular", {
				language: "en-US",
				timezone: "America/New_York",
			});
		});
	});

	describe("top_rated", () => {
		it("should call client.request with the correct endpoint and default options", async () => {
			await tvSeriesListsAPI.top_rated();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/top_rated", {
				language: "en-US",
				timezone: "America/New_York",
			});
		});

		it("should work without any defaultOptions", async () => {
			tvSeriesListsAPI = new TVSeriesListsAPI(clientMock);
			await tvSeriesListsAPI.top_rated({ page: 1 });
			expect(clientMock.request).toHaveBeenCalledWith("/tv/top_rated", {
				language: undefined,
				timezone: undefined,
				page: 1,
			});
		});
	});
});
