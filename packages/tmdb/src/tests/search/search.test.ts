import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { SearchAPI } from "../../endpoints/search";

describe("SearchAPI", () => {
	let clientMock: ApiClient;
	let searchAPI: SearchAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		searchAPI = new SearchAPI(clientMock, { language: "en-US", region: "US" });
	});

	describe("collections", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await searchAPI.collections({ query: "star wars", language: "en-US", page: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/search/collection", {
				query: "star wars",
				language: "en-US",
				page: 1,
				region: "US",
			});
		});

		it("should apply defaultOptions when no language/region is provided", async () => {
			await searchAPI.collections({ query: "marvel" });
			expect(clientMock.request).toHaveBeenCalledWith("/search/collection", {
				query: "marvel",
				language: "en-US",
				region: "US",
			});
		});
	});

	describe("movies", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await searchAPI.movies({ query: "inception", language: "fr-FR", page: 2 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/search/movie", {
				query: "inception",
				language: "fr-FR",
				page: 2,
				region: "US",
			});
		});

		it("should apply defaultOptions language and region", async () => {
			await searchAPI.movies({ query: "batman" });
			expect(clientMock.request).toHaveBeenCalledWith(
				"/search/movie",
				expect.objectContaining({ query: "batman", language: "en-US", region: "US" }),
			);
		});
	});

	describe("company", () => {
		it("should call client.request with the correct endpoint", async () => {
			await searchAPI.company({ query: "warner", page: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/search/company", {
				query: "warner",
				page: 1,
				language: "en-US",
				region: "US",
			});
		});
	});

	describe("keyword", () => {
		it("should call client.request with the correct endpoint", async () => {
			await searchAPI.keyword({ query: "time travel" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/search/keyword", {
				query: "time travel",
				language: "en-US",
				region: "US",
			});
		});
	});

	describe("person", () => {
		it("should call client.request with the correct endpoint", async () => {
			await searchAPI.person({ query: "tom hanks", page: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/search/person", {
				query: "tom hanks",
				page: 1,
				language: "en-US",
				region: "US",
			});
		});
	});

	describe("tv_series", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await searchAPI.tv_series({ query: "breaking bad", language: "en-US", page: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/search/tv", {
				query: "breaking bad",
				language: "en-US",
				page: 1,
				region: "US",
			});
		});
	});

	describe("multi", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await searchAPI.multi({ query: "avengers", include_adult: false });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/search/multi", {
				query: "avengers",
				include_adult: false,
				language: "en-US",
				region: "US",
			});
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { page: 1, results: [], total_pages: 1, total_results: 0 };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await searchAPI.multi({ query: "marvel" });
			expect(result).toEqual(fakeResponse);
		});
	});
});
