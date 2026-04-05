import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../client";
import { GuestSessionsAPI } from "../../endpoints/guest_sessions";

describe("GuestSessionsAPI", () => {
	let clientMock: ApiClient;
	let api: GuestSessionsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		api = new GuestSessionsAPI(clientMock);
	});

	describe("rated_movies", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.rated_movies({ guest_session_id: "abc123" });
			expect(clientMock.request).toHaveBeenCalledWith("/guest_session/abc123/rated/movies", {
				language: undefined,
			});
		});

		it("should pass language param when provided", async () => {
			await api.rated_movies({ guest_session_id: "abc123", language: "fr-FR" });
			expect(clientMock.request).toHaveBeenCalledWith("/guest_session/abc123/rated/movies", {
				language: "fr-FR",
			});
		});

		it("should pass page and sort_by params", async () => {
			await api.rated_movies({ guest_session_id: "abc123", page: 2, sort_by: "created_at.desc" });
			expect(clientMock.request).toHaveBeenCalledWith("/guest_session/abc123/rated/movies", {
				language: undefined,
				page: 2,
				sort_by: "created_at.desc",
			});
		});

		it("should use defaultOptions.language when no language param", async () => {
			api = new GuestSessionsAPI(clientMock, { language: "de-DE" });
			await api.rated_movies({ guest_session_id: "abc123" });
			expect(clientMock.request).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ language: "de-DE" }));
		});

		it("should return the result from client.request", async () => {
			const mockData = { page: 1, results: [], total_pages: 1, total_results: 0 };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.rated_movies({ guest_session_id: "abc123" });
			expect(result).toEqual(mockData);
		});
	});

	describe("rated_tv", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.rated_tv({ guest_session_id: "abc123" });
			expect(clientMock.request).toHaveBeenCalledWith("/guest_session/abc123/rated/tv", {
				language: undefined,
			});
		});

		it("should pass language param when provided", async () => {
			await api.rated_tv({ guest_session_id: "abc123", language: "es-ES" });
			expect(clientMock.request).toHaveBeenCalledWith("/guest_session/abc123/rated/tv", {
				language: "es-ES",
			});
		});

		it("should pass page and sort_by params", async () => {
			await api.rated_tv({ guest_session_id: "abc123", page: 3, sort_by: "created_at.asc" });
			expect(clientMock.request).toHaveBeenCalledWith("/guest_session/abc123/rated/tv", {
				language: undefined,
				page: 3,
				sort_by: "created_at.asc",
			});
		});

		it("should use defaultOptions.language when no language param", async () => {
			api = new GuestSessionsAPI(clientMock, { language: "ja-JP" });
			await api.rated_tv({ guest_session_id: "abc123" });
			expect(clientMock.request).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ language: "ja-JP" }));
		});

		it("should return the result from client.request", async () => {
			const mockData = { page: 1, results: [], total_pages: 1, total_results: 0 };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.rated_tv({ guest_session_id: "abc123" });
			expect(result).toEqual(mockData);
		});
	});

	describe("rated_tv_episodes", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.rated_tv_episodes({ guest_session_id: "abc123" });
			expect(clientMock.request).toHaveBeenCalledWith("/guest_session/abc123/rated/tv/episodes", {
				language: undefined,
			});
		});

		it("should pass language param when provided", async () => {
			await api.rated_tv_episodes({ guest_session_id: "abc123", language: "ko-KR" });
			expect(clientMock.request).toHaveBeenCalledWith("/guest_session/abc123/rated/tv/episodes", {
				language: "ko-KR",
			});
		});

		it("should pass page and sort_by params", async () => {
			await api.rated_tv_episodes({ guest_session_id: "abc123", page: 1, sort_by: "created_at.desc" });
			expect(clientMock.request).toHaveBeenCalledWith("/guest_session/abc123/rated/tv/episodes", {
				language: undefined,
				page: 1,
				sort_by: "created_at.desc",
			});
		});

		it("should use defaultOptions.language when no language param", async () => {
			api = new GuestSessionsAPI(clientMock, { language: "pt-BR" });
			await api.rated_tv_episodes({ guest_session_id: "abc123" });
			expect(clientMock.request).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ language: "pt-BR" }));
		});

		it("should return the result from client.request", async () => {
			const mockData = { page: 1, results: [], total_pages: 1, total_results: 0 };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.rated_tv_episodes({ guest_session_id: "abc123" });
			expect(result).toEqual(mockData);
		});
	});
});
