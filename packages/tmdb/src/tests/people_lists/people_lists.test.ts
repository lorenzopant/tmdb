import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../client";
import { PeopleListsAPI } from "../../endpoints/people_lists";

describe("PeopleListsAPI", () => {
	let clientMock: ApiClient;
	let api: PeopleListsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		api = new PeopleListsAPI(clientMock);
	});

	describe("popular()", () => {
		it("should call client.request with correct endpoint", async () => {
			await api.popular();
			expect(clientMock.request).toHaveBeenCalledWith("/person/popular", {});
		});

		it("should pass language param when provided", async () => {
			await api.popular({ language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledWith("/person/popular", { language: "en-US" });
		});

		it("should pass page param when provided", async () => {
			await api.popular({ page: 2 });
			expect(clientMock.request).toHaveBeenCalledWith("/person/popular", { page: 2 });
		});

		it("should return the result from client.request", async () => {
			const mockData = { page: 1, results: [], total_pages: 1, total_results: 0 };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.popular();
			expect(result).toEqual(mockData);
		});

		it("should use defaultOptions.language when no language param", async () => {
			api = new PeopleListsAPI(clientMock, { language: "fr-FR" });
			await api.popular();
			expect(clientMock.request).toHaveBeenCalledWith("/person/popular", expect.objectContaining({ language: "fr-FR" }));
		});

		it("should prefer explicit language over defaultOptions.language", async () => {
			api = new PeopleListsAPI(clientMock, { language: "fr-FR" });
			await api.popular({ language: "de-DE" });
			expect(clientMock.request).toHaveBeenCalledWith("/person/popular", expect.objectContaining({ language: "de-DE" }));
		});
	});
});
