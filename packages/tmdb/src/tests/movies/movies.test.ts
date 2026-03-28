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
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/alternative_titles", { country: "US" });
		});
	});

	describe("changes", () => {
		it("should call client.request without movie_id in query params", async () => {
			await moviesAPI.changes({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/changes", {});
		});

		it("should forward date range and page query params", async () => {
			await moviesAPI.changes({ movie_id: 550, start_date: "2024-01-01", end_date: "2024-01-14", page: 2 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/movie/550/changes", {
				start_date: "2024-01-01",
				end_date: "2024-01-14",
				page: 2,
			});
		});
	});
});
