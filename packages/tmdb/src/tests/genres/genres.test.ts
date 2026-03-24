import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { GenresAPI } from "../../endpoints/genres";

describe("GenresAPI", () => {
	let clientMock: ApiClient;
	let genresAPI: GenresAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		genresAPI = new GenresAPI(clientMock);
	});

	describe("movie_list", () => {
		it("should call client.request with the correct endpoint without params", async () => {
			await genresAPI.movie_list();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/genre/movie/list", undefined);
		});

		it("should call client.request with the correct endpoint and language param", async () => {
			await genresAPI.movie_list({ language: "it-IT" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/genre/movie/list", { language: "it-IT" });
		});

		it("should apply defaultOptions.language when called without params", async () => {
			genresAPI = new GenresAPI(clientMock, { language: "fr-FR" });
			await genresAPI.movie_list();
			expect(clientMock.request).toHaveBeenCalledWith("/genre/movie/list", { language: "fr-FR" });
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { genres: [{ id: 28, name: "Action" }] };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await genresAPI.movie_list();
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("tv_list", () => {
		it("should call client.request with the correct endpoint without params", async () => {
			await genresAPI.tv_list();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/genre/tv/list", undefined);
		});

		it("should call client.request with the correct endpoint and language param", async () => {
			await genresAPI.tv_list({ language: "es-ES" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/genre/tv/list", { language: "es-ES" });
		});

		it("should apply defaultOptions.language when called without params", async () => {
			genresAPI = new GenresAPI(clientMock, { language: "de-DE" });
			await genresAPI.tv_list();
			expect(clientMock.request).toHaveBeenCalledWith("/genre/tv/list", { language: "de-DE" });
		});
	});
});
