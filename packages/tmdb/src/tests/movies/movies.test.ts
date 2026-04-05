import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { MoviesAPI } from "../../endpoints/movies";
import { MovieAppendToResponseNamespace } from "../../types/movies";

describe("MoviesAPI", () => {
	let clientMock: ApiClient;
	let moviesAPI: MoviesAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		moviesAPI = new MoviesAPI(clientMock);
	});

	it("should call client.request with the correct parameters", async () => {
		const movie_id = 550;
		const language = "en-US";
		const append_to_response: MovieAppendToResponseNamespace[] = ["credits", "images"];

		await moviesAPI.details({ movie_id, language, append_to_response });
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/movie/550", {
			append_to_response,
			language,
		});
	});

	it("should work correctly without optional parameters", async () => {
		const movie_id = 550;
		await moviesAPI.details({ movie_id });
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/movie/550", {
			append_to_response: undefined,
			language: undefined,
		});
	});

	it("should return the result from client.request", async () => {
		const fakeResponse = { id: 550, title: "Fight Club" };
		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
		const result = await moviesAPI.details({ movie_id: 550 });
		expect(result).toEqual(fakeResponse);
	});

	describe("alternative_titles", () => {
		it("should call client.request without movie_id in query params", async () => {
			await moviesAPI.alternative_titles({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/alternative_titles", {});
		});

		it("should forward the country query param", async () => {
			await moviesAPI.alternative_titles({ movie_id: 550, country: "US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/alternative_titles", {
				country: "US",
			});
		});
	});

	describe("changes", () => {
		it("should call client.request without movie_id in query params", async () => {
			await moviesAPI.changes({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/changes", {});
		});

		it("should forward date range and page query params", async () => {
			await moviesAPI.changes({
				movie_id: 550,
				start_date: "2024-01-01",
				end_date: "2024-01-14",
				page: 2,
			});
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/changes", {
				start_date: "2024-01-01",
				end_date: "2024-01-14",
				page: 2,
			});
		});
	});

	describe("credits", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.credits({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/credits", {
				language: undefined,
			});
		});

		it("should not include movie_id in query params", async () => {
			await moviesAPI.credits({ movie_id: 550 });
			const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(params).not.toHaveProperty("movie_id");
		});

		it("should forward language param", async () => {
			await moviesAPI.credits({ movie_id: 550, language: "fr-FR" });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/credits", { language: "fr-FR" });
		});

		it("should fall back to defaultOptions.language", async () => {
			const api = new MoviesAPI(clientMock, { language: "de-DE" });
			await api.credits({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/credits", { language: "de-DE" });
		});
	});

	describe("external_ids", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.external_ids({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/external_ids");
		});
	});

	describe("keywords", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.keywords({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/keywords");
		});
	});

	describe("images", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.images({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/images", { language: undefined });
		});

		it("should not include movie_id in query params", async () => {
			await moviesAPI.images({ movie_id: 550 });
			const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(params).not.toHaveProperty("movie_id");
		});

		it("should forward language and include_image_language params", async () => {
			await moviesAPI.images({
				movie_id: 550,
				language: "en-US",
				include_image_language: ["fr", "null"],
			});
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/images", {
				language: "en-US",
				include_image_language: ["fr", "null"],
			});
		});

		it("should fall back to defaultOptions.language", async () => {
			const api = new MoviesAPI(clientMock, { language: "it-IT" });
			await api.images({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/images", { language: "it-IT" });
		});

		describe("auto_include_image_language", () => {
			it("should inject include_image_language from image_language_priority when enabled", async () => {
				const api = new MoviesAPI(clientMock, {
					images: {
						auto_include_image_language: true,
						image_language_priority: { posters: ["it", "null", "*"], backdrops: ["en"] },
					},
				});
				await api.images({ movie_id: 550 });
				const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
				expect(params.include_image_language).toEqual(expect.arrayContaining(["it", "null", "en"]));
				expect(params.include_image_language).not.toContain("*");
			});

			it("should not override an explicit include_image_language on the call site", async () => {
				const api = new MoviesAPI(clientMock, {
					images: {
						auto_include_image_language: true,
						image_language_priority: { posters: ["it"] },
					},
				});
				await api.images({ movie_id: 550, include_image_language: ["fr", "null"] });
				const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
				expect(params.include_image_language).toEqual(["fr", "null"]);
			});

			it("should not inject when auto_include_image_language is false", async () => {
				const api = new MoviesAPI(clientMock, {
					images: {
						auto_include_image_language: false,
						image_language_priority: { posters: ["it"] },
					},
				});
				await api.images({ movie_id: 550 });
				const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
				expect(params.include_image_language).toBeUndefined();
			});

			it("should not inject when image_language_priority is absent", async () => {
				const api = new MoviesAPI(clientMock, { images: { auto_include_image_language: true } });
				await api.images({ movie_id: 550 });
				const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
				expect(params.include_image_language).toBeUndefined();
			});
		});
	});

	describe("latest", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.latest();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/latest");
		});
	});

	describe("recommendations", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.recommendations({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/recommendations", {
				language: undefined,
			});
		});

		it("should not include movie_id in query params", async () => {
			await moviesAPI.recommendations({ movie_id: 550 });
			const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(params).not.toHaveProperty("movie_id");
		});

		it("should forward language and page params", async () => {
			await moviesAPI.recommendations({ movie_id: 550, language: "en-US", page: 2 });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/recommendations", {
				language: "en-US",
				page: 2,
			});
		});

		it("should fall back to defaultOptions.language", async () => {
			const api = new MoviesAPI(clientMock, { language: "ja-JP" });
			await api.recommendations({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/recommendations", {
				language: "ja-JP",
			});
		});
	});

	describe("release_dates", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.release_dates({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/release_dates");
		});
	});

	describe("reviews", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.reviews({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/reviews", {
				language: undefined,
			});
		});

		it("should not include movie_id in query params", async () => {
			await moviesAPI.reviews({ movie_id: 550 });
			const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(params).not.toHaveProperty("movie_id");
		});

		it("should forward language and page params", async () => {
			await moviesAPI.reviews({ movie_id: 550, language: "en-US", page: 3 });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/reviews", {
				language: "en-US",
				page: 3,
			});
		});

		it("should fall back to defaultOptions.language", async () => {
			const api = new MoviesAPI(clientMock, { language: "es-ES" });
			await api.reviews({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/reviews", { language: "es-ES" });
		});
	});

	describe("similar", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.similar({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/similar", {
				language: undefined,
			});
		});

		it("should not include movie_id in query params", async () => {
			await moviesAPI.similar({ movie_id: 550 });
			const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(params).not.toHaveProperty("movie_id");
		});

		it("should forward language and page params", async () => {
			await moviesAPI.similar({ movie_id: 550, language: "en-US", page: 2 });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/similar", {
				language: "en-US",
				page: 2,
			});
		});

		it("should fall back to defaultOptions.language", async () => {
			const api = new MoviesAPI(clientMock, { language: "pt-BR" });
			await api.similar({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/similar", { language: "pt-BR" });
		});
	});

	describe("translations", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.translations({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/translations");
		});
	});

	describe("videos", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.videos({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/videos", { language: undefined });
		});

		it("should not include movie_id in query params", async () => {
			await moviesAPI.videos({ movie_id: 550 });
			const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(params).not.toHaveProperty("movie_id");
		});

		it("should forward language param", async () => {
			await moviesAPI.videos({ movie_id: 550, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/videos", { language: "en-US" });
		});

		it("should fall back to defaultOptions.language", async () => {
			const api = new MoviesAPI(clientMock, { language: "ko-KR" });
			await api.videos({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/videos", { language: "ko-KR" });
		});
	});

	describe("watch_providers", () => {
		it("should call client.request with the correct endpoint", async () => {
			await moviesAPI.watch_providers({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/watch/providers");
		});
	});
});
