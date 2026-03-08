import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { DiscoverAPI } from "../../endpoints/discover";

describe("DiscoverAPI", () => {
	let clientMock: ApiClient;
	let discoverAPI: DiscoverAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		discoverAPI = new DiscoverAPI(clientMock, {
			language: "en-US",
			region: "US",
			timezone: "Europe/Rome",
		});
	});

	it("should call client.request with the correct movie discover parameters", async () => {
		await discoverAPI.movie({
			include_adult: false,
			page: 2,
			sort_by: "popularity.desc",
			region: "IT",
			with_genres: "28|12",
		});

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/discover/movie", {
			language: "en-US",
			region: "IT",
			include_adult: false,
			page: 2,
			sort_by: "popularity.desc",
			with_genres: "28|12",
		});
	});

	it("should apply default language and region to movie discover when not provided", async () => {
		await discoverAPI.movie();

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/discover/movie", {
			language: "en-US",
			region: "US",
		});
	});

	it("should keep movie defaults when language and region are explicitly undefined", async () => {
		await discoverAPI.movie({
			language: undefined,
			region: undefined,
			page: 4,
		});

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/discover/movie", {
			language: "en-US",
			region: "US",
			page: 4,
		});
	});

	it("should call client.request with the correct tv discover parameters", async () => {
		await discoverAPI.tv({
			page: 3,
			sort_by: "vote_average.desc",
			timezone: "America/New_York",
			with_status: "0|2",
			with_type: "2,4",
		});

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/discover/tv", {
			language: "en-US",
			timezone: "America/New_York",
			page: 3,
			sort_by: "vote_average.desc",
			with_status: "0|2",
			with_type: "2,4",
		});
	});

	it("should apply default language and timezone to tv discover when not provided", async () => {
		await discoverAPI.tv();

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/discover/tv", {
			language: "en-US",
			timezone: "Europe/Rome",
		});
	});

	it("should keep tv defaults when language and timezone are explicitly undefined", async () => {
		await discoverAPI.tv({
			language: undefined,
			timezone: undefined,
			page: 5,
		});

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/discover/tv", {
			language: "en-US",
			timezone: "Europe/Rome",
			page: 5,
		});
	});

	it("should return the result from client.request", async () => {
		const fakeResponse = {
			page: 1,
			total_pages: 1,
			total_results: 1,
			results: [{ id: 550, title: "Fight Club" }],
		};
		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);

		const result = await discoverAPI.movie();

		expect(result).toEqual(fakeResponse);
	});
});
