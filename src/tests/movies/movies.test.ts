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
		const language = "en";
		const append_to_response: MovieAppendToResponseNamespace[] = ["credits", "images"];

		await moviesAPI.details({ movie_id, language, append_to_response });
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/movie/550", {
			movie_id,
			append_to_response,
			language,
		});
	});

	it("should work correctly without optional parameters", async () => {
		const movie_id = 550;
		await moviesAPI.details({ movie_id });
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/movie/550", {
			movie_id,
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
});
