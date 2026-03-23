import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { ChangesAPI } from "../../endpoints/changes";

describe("ChangesAPI", () => {
	let clientMock: ApiClient;
	let changesAPI: ChangesAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		changesAPI = new ChangesAPI(clientMock);
	});

	it("should call client.request with the correct endpoint for movie_list without params", async () => {
		await changesAPI.movie_list();
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/movie/changes", undefined);
	});

	it("should call client.request with the correct endpoint for movie_list with params", async () => {
		await changesAPI.movie_list({ page: 2, start_date: "2024-01-01", end_date: "2024-01-14" });
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/movie/changes", {
			page: 2,
			start_date: "2024-01-01",
			end_date: "2024-01-14",
		});
	});

	it("should call client.request with the correct endpoint for people_list without params", async () => {
		await changesAPI.people_list();
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/person/changes", undefined);
	});

	it("should call client.request with the correct endpoint for people_list with params", async () => {
		await changesAPI.people_list({ page: 1, start_date: "2024-06-01" });
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/person/changes", {
			page: 1,
			start_date: "2024-06-01",
		});
	});

	it("should call client.request with the correct endpoint for tv_list without params", async () => {
		await changesAPI.tv_list();
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/tv/changes", undefined);
	});

	it("should call client.request with the correct endpoint for tv_list with params", async () => {
		await changesAPI.tv_list({ page: 3, end_date: "2024-12-31" });
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/tv/changes", { page: 3, end_date: "2024-12-31" });
	});

	it("should return the result from client.request", async () => {
		const fakeResponse = { results: [], page: 1, total_pages: 1, total_results: 0 };
		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
		const result = await changesAPI.movie_list();
		expect(result).toEqual(fakeResponse);
	});
});
