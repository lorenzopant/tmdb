import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../client";
import { MoviesAPI } from "../../endpoints/movies";
import { TMDB } from "../../tmdb";

let tmdb: TMDB = new TMDB("valid_access_token");

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
		const append_to_response = ["credits", "images"];
		const language = "en-US";

		await moviesAPI.details(movie_id, append_to_response, language);
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/movie/550", {
			append_to_response,
			language,
		});
	});

	it("should work correctly without optional parameters", async () => {
		const movie_id = 550;
		await moviesAPI.details(movie_id);
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/movie/550", {
			append_to_response: undefined,
			language: undefined,
		});
	});

	it("should return the result from client.request", async () => {
		const fakeResponse = { id: 550, title: "Fight Club" };
		(clientMock.request as any).mockResolvedValue(fakeResponse);
		const result = await moviesAPI.details(550);
		expect(result).toEqual(fakeResponse);
	});
});
