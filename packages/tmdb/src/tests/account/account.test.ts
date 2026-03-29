import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { AccountAPI } from "../../endpoints/account";

describe("AccountAPI", () => {
	let clientMock: ApiClient;
	let api: AccountAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		api = new AccountAPI(clientMock);
	});

	describe("details", () => {
		it("should call client.request with correct endpoint", async () => {
			await api.details({ account_id: 123 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/account/123", {});
		});

		it("should pass session_id when provided", async () => {
			await api.details({ account_id: 123, session_id: "abc123" });
			expect(clientMock.request).toHaveBeenCalledWith("/account/123", { session_id: "abc123" });
		});

		it("should return the result from client.request", async () => {
			const mockData = { id: 123, username: "testuser", name: "Test User" };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.details({ account_id: 123 });
			expect(result).toEqual(mockData);
		});
	});

	describe("favorite_movies", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.favorite_movies({ account_id: 123, language: "en-US", page: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/account/123/favorite/movies", {
				language: "en-US",
				page: 1,
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			api = new AccountAPI(clientMock, { language: "it-IT" });
			await api.favorite_movies({ account_id: 123 });
			expect(clientMock.request).toHaveBeenCalledWith(
				"/account/123/favorite/movies",
				expect.objectContaining({ language: "it-IT" }),
			);
		});

		it("should pass sort_by and session_id when provided", async () => {
			await api.favorite_movies({
				account_id: 123,
				sort_by: "created_at.desc",
				session_id: "sess",
			});
			expect(clientMock.request).toHaveBeenCalledWith("/account/123/favorite/movies", {
				language: undefined,
				sort_by: "created_at.desc",
				session_id: "sess",
			});
		});
	});

	describe("favorite_tv", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.favorite_tv({ account_id: 123, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/account/123/favorite/tv", {
				language: "en-US",
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			api = new AccountAPI(clientMock, { language: "fr-FR" });
			await api.favorite_tv({ account_id: 123 });
			expect(clientMock.request).toHaveBeenCalledWith(
				"/account/123/favorite/tv",
				expect.objectContaining({ language: "fr-FR" }),
			);
		});
	});

	describe("watchlist_movies", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.watchlist_movies({ account_id: 456, language: "es-ES", page: 2 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/account/456/watchlist/movies", {
				language: "es-ES",
				page: 2,
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			api = new AccountAPI(clientMock, { language: "de-DE" });
			await api.watchlist_movies({ account_id: 456 });
			expect(clientMock.request).toHaveBeenCalledWith(
				"/account/456/watchlist/movies",
				expect.objectContaining({ language: "de-DE" }),
			);
		});
	});

	describe("watchlist_tv", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.watchlist_tv({ account_id: 456, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/account/456/watchlist/tv", {
				language: "en-US",
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			api = new AccountAPI(clientMock, { language: "ja-JP" });
			await api.watchlist_tv({ account_id: 456 });
			expect(clientMock.request).toHaveBeenCalledWith(
				"/account/456/watchlist/tv",
				expect.objectContaining({ language: "ja-JP" }),
			);
		});
	});

	describe("rated_movies", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.rated_movies({ account_id: 123, language: "en-US", sort_by: "created_at.asc" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/account/123/rated/movies", {
				language: "en-US",
				sort_by: "created_at.asc",
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			api = new AccountAPI(clientMock, { language: "pt-BR" });
			await api.rated_movies({ account_id: 123 });
			expect(clientMock.request).toHaveBeenCalledWith(
				"/account/123/rated/movies",
				expect.objectContaining({ language: "pt-BR" }),
			);
		});
	});

	describe("rated_tv", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.rated_tv({ account_id: 123, language: "en-US", page: 3 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/account/123/rated/tv", {
				language: "en-US",
				page: 3,
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			api = new AccountAPI(clientMock, { language: "ko-KR" });
			await api.rated_tv({ account_id: 123 });
			expect(clientMock.request).toHaveBeenCalledWith(
				"/account/123/rated/tv",
				expect.objectContaining({ language: "ko-KR" }),
			);
		});
	});

	describe("rated_tv_episodes", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.rated_tv_episodes({ account_id: 123, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/account/123/rated/tv/episodes", {
				language: "en-US",
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			api = new AccountAPI(clientMock, { language: "zh-CN" });
			await api.rated_tv_episodes({ account_id: 123 });
			expect(clientMock.request).toHaveBeenCalledWith(
				"/account/123/rated/tv/episodes",
				expect.objectContaining({ language: "zh-CN" }),
			);
		});

		it("should pass sort_by when provided", async () => {
			await api.rated_tv_episodes({ account_id: 123, sort_by: "created_at.desc" });
			expect(clientMock.request).toHaveBeenCalledWith("/account/123/rated/tv/episodes", {
				language: undefined,
				sort_by: "created_at.desc",
			});
		});
	});

	describe("lists", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.lists({ account_id: 123, page: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/account/123/lists", { page: 1 });
		});

		it("should pass session_id when provided", async () => {
			await api.lists({ account_id: 123, session_id: "sess456" });
			expect(clientMock.request).toHaveBeenCalledWith("/account/123/lists", {
				session_id: "sess456",
			});
		});

		it("should return the result from client.request", async () => {
			const mockData = { page: 1, results: [], total_pages: 1, total_results: 0 };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.lists({ account_id: 123 });
			expect(result).toEqual(mockData);
		});
	});
});
