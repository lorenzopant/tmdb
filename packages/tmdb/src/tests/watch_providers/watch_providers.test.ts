import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { WatchProvidersAPI } from "../../endpoints/watch_providers";

describe("WatchProvidersAPI", () => {
	let clientMock: ApiClient;
	let watchProvidersAPI: WatchProvidersAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		watchProvidersAPI = new WatchProvidersAPI(clientMock, { language: "en-US" });
	});

	it("should call client.request with the correct movie providers parameters", async () => {
		await watchProvidersAPI.movie_providers({ language: "it-IT" });

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/watch/providers/movie", {
			language: "it-IT",
		});
	});

	it("should apply the default language for movie providers when none is provided", async () => {
		await watchProvidersAPI.movie_providers();

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/watch/providers/movie", {
			language: "en-US",
		});
	});

	it("should pass undefined params to movie providers when no language defaults exist", async () => {
		watchProvidersAPI = new WatchProvidersAPI(clientMock);
		await watchProvidersAPI.movie_providers();

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/watch/providers/movie", undefined);
	});

	it("should call client.request with the correct tv providers parameters", async () => {
		await watchProvidersAPI.tv_providers({ language: "it-IT" });

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/watch/providers/tv", {
			language: "it-IT",
		});
	});

	it("should pass undefined params to tv providers when no language defaults exist", async () => {
		watchProvidersAPI = new WatchProvidersAPI(clientMock);
		await watchProvidersAPI.tv_providers();

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/watch/providers/tv", undefined);
	});

	it("should call client.request with the correct available regions parameters", async () => {
		await watchProvidersAPI.available_regions({ language: "it-IT" });

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/watch/providers/regions", {
			language: "it-IT",
		});
	});

	it("should pass undefined params to available regions when no language defaults exist", async () => {
		watchProvidersAPI = new WatchProvidersAPI(clientMock);
		await watchProvidersAPI.available_regions();

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/watch/providers/regions", undefined);
	});

	it("should return the result from client.request", async () => {
		const fakeResponse = {
			results: [{ provider_id: 8, provider_name: "Netflix" }],
		};
		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);

		const result = await watchProvidersAPI.movie_providers();

		expect(result).toEqual(fakeResponse);
	});
});
