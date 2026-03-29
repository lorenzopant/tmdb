import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { KeywordsAPI } from "../../endpoints/keywords";

describe("KeywordsAPI", () => {
	let clientMock: ApiClient;
	let keywordsAPI: KeywordsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		keywordsAPI = new KeywordsAPI(clientMock, { language: "en-US" });
	});

	it("should call client.request with the correct details parameters", async () => {
		await keywordsAPI.details({ keyword_id: 4379 });

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/keyword/4379");
	});

	it("should call client.request with the correct movies parameters", async () => {
		await keywordsAPI.movies({
			keyword_id: 4379,
			language: "it-IT",
			page: 2,
			include_adult: false,
		});

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/keyword/4379/movies", {
			language: "it-IT",
			page: 2,
			include_adult: false,
		});
	});

	it("should apply the default language for movies when none is provided", async () => {
		await keywordsAPI.movies({ keyword_id: 4379 });

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/keyword/4379/movies", {
			language: "en-US",
		});
	});

	it("should keep the default language for movies when it is explicitly undefined", async () => {
		await keywordsAPI.movies({
			keyword_id: 4379,
			language: undefined,
			page: 3,
		});

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/keyword/4379/movies", {
			language: "en-US",
			page: 3,
		});
	});

	it("should return the result from client.request for details", async () => {
		const fakeResponse = { id: 4379, name: "time travel" };
		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);

		const result = await keywordsAPI.details({ keyword_id: 4379 });

		expect(result).toEqual(fakeResponse);
	});
});
