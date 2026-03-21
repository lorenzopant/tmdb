import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { TrendingAPI } from "../../endpoints/trending";

describe("TrendingAPI", () => {
	let clientMock: ApiClient;
	let trendingAPI: TrendingAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		trendingAPI = new TrendingAPI(clientMock);
	});

	// MARK: all()
	describe("all()", () => {
		it("should call client.request with the correct endpoint for time_window=day", async () => {
			await trendingAPI.all({ time_window: "day" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/all/day", { language: undefined });
		});

		it("should call client.request with the correct endpoint for time_window=week", async () => {
			await trendingAPI.all({ time_window: "week" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/all/week", { language: undefined });
		});

		it("should pass the language param as a query param", async () => {
			await trendingAPI.all({ time_window: "day", language: "fr-FR" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/all/day", { language: "fr-FR" });
		});

		it("should use defaultOptions.language when no language param provided", async () => {
			trendingAPI = new TrendingAPI(clientMock, { language: "it-IT" });
			await trendingAPI.all({ time_window: "day" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/all/day", { language: "it-IT" });
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { page: 1, results: [], total_pages: 1, total_results: 0 };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await trendingAPI.all({ time_window: "day" });
			expect(result).toEqual(fakeResponse);
		});
	});

	// MARK: movies()
	describe("movies()", () => {
		it("should call client.request with the correct endpoint for time_window=day", async () => {
			await trendingAPI.movies({ time_window: "day" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/movie/day", { language: undefined });
		});

		it("should call client.request with the correct endpoint for time_window=week", async () => {
			await trendingAPI.movies({ time_window: "week" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/movie/week", { language: undefined });
		});

		it("should pass the language param as a query param", async () => {
			await trendingAPI.movies({ time_window: "day", language: "es-ES" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/movie/day", { language: "es-ES" });
		});

		it("should use defaultOptions.language when no language param provided", async () => {
			trendingAPI = new TrendingAPI(clientMock, { language: "de-DE" });
			await trendingAPI.movies({ time_window: "week" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/movie/week", { language: "de-DE" });
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = {
				page: 1,
				results: [{ id: 550, title: "Fight Club", media_type: "movie" }],
				total_pages: 1000,
				total_results: 20000,
			};
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await trendingAPI.movies({ time_window: "day" });
			expect(result).toEqual(fakeResponse);
		});
	});

	// MARK: tv()
	describe("tv()", () => {
		it("should call client.request with the correct endpoint for time_window=day", async () => {
			await trendingAPI.tv({ time_window: "day" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/tv/day", { language: undefined });
		});

		it("should call client.request with the correct endpoint for time_window=week", async () => {
			await trendingAPI.tv({ time_window: "week" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/tv/week", { language: undefined });
		});

		it("should pass the language param as a query param", async () => {
			await trendingAPI.tv({ time_window: "day", language: "ja-JP" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/tv/day", { language: "ja-JP" });
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = {
				page: 1,
				results: [{ id: 1234, name: "Some Show", media_type: "tv" }],
				total_pages: 1000,
				total_results: 20000,
			};
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await trendingAPI.tv({ time_window: "week" });
			expect(result).toEqual(fakeResponse);
		});
	});

	// MARK: people()
	describe("people()", () => {
		it("should call client.request with the correct endpoint for time_window=day", async () => {
			await trendingAPI.people({ time_window: "day" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/person/day", { language: undefined });
		});

		it("should call client.request with the correct endpoint for time_window=week", async () => {
			await trendingAPI.people({ time_window: "week" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/person/week", { language: undefined });
		});

		it("should pass the language param as a query param", async () => {
			await trendingAPI.people({ time_window: "week", language: "ko-KR" });
			expect(clientMock.request).toHaveBeenCalledWith("/trending/person/week", { language: "ko-KR" });
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = {
				page: 1,
				results: [{ id: 1, name: "Ana de Armas", media_type: "person" }],
				total_pages: 1000,
				total_results: 20000,
			};
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await trendingAPI.people({ time_window: "day" });
			expect(result).toEqual(fakeResponse);
		});
	});
});
