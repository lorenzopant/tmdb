import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { NetworksAPI } from "../../endpoints/networks";

describe("NetworksAPI", () => {
	let clientMock: ApiClient;
	let networksAPI: NetworksAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		networksAPI = new NetworksAPI(clientMock);
	});

	describe("details", () => {
		it("should call client.request with the correct endpoint", async () => {
			await networksAPI.details({ network_id: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/network/1", { network_id: 1 });
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { id: 1, name: "Fuji TV" };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await networksAPI.details({ network_id: 1 });
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("alternative_names", () => {
		it("should call client.request with the correct endpoint", async () => {
			await networksAPI.alternative_names({ network_id: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/network/1/alternative_names", { network_id: 1 });
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { id: 1, results: [] };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await networksAPI.alternative_names({ network_id: 1 });
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("images", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await networksAPI.images({ network_id: 1 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/network/1/images");
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { id: 1, logos: [] };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await networksAPI.images({ network_id: 1 });
			expect(result).toEqual(fakeResponse);
		});
	});
});
