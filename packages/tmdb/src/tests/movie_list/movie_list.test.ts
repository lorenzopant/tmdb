import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { MovieListsAPI } from "../../endpoints/movie_lists";

describe("MovieListsAPI", () => {
	let clientMock: ApiClient;
	let movieListsAPI: MovieListsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		movieListsAPI = new MovieListsAPI(clientMock, { language: "en-US", region: "US" });
	});

	describe("now_playing", () => {
		it("should call client.request with the correct endpoint and default options", async () => {
			await movieListsAPI.now_playing();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/now_playing", {
				language: "en-US",
				region: "US",
			});
		});

		it("should merge explicit params with default options", async () => {
			await movieListsAPI.now_playing({ page: 2, language: "fr-FR" });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/now_playing", {
				language: "fr-FR",
				region: "US",
				page: 2,
			});
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { page: 1, results: [], total_pages: 1, total_results: 0 };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await movieListsAPI.now_playing();
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("popular", () => {
		it("should call client.request with the correct endpoint and default options", async () => {
			await movieListsAPI.popular();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/popular", {
				language: "en-US",
				region: "US",
			});
		});

		it("should merge explicit params with default options", async () => {
			await movieListsAPI.popular({ page: 3, region: "GB" });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/popular", {
				language: "en-US",
				region: "GB",
				page: 3,
			});
		});
	});

	describe("top_rated", () => {
		it("should call client.request with the correct endpoint and default options", async () => {
			await movieListsAPI.top_rated();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/top_rated", {
				language: "en-US",
				region: "US",
			});
		});
	});

	describe("upcoming", () => {
		it("should call client.request with the correct endpoint and default options", async () => {
			await movieListsAPI.upcoming();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/upcoming", {
				language: "en-US",
				region: "US",
			});
		});

		it("should work without any defaultOptions", async () => {
			movieListsAPI = new MovieListsAPI(clientMock);
			await movieListsAPI.upcoming({ page: 1 });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/upcoming", {
				language: undefined,
				region: undefined,
				page: 1,
			});
		});
	});
});
