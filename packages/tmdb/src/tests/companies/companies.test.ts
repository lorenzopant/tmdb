import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { CompaniesAPI } from "../../endpoints/companies";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");
describe("CompaniesAPI", () => {
	let clientMock: ApiClient;
	let companiesAPI: CompaniesAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		companiesAPI = new CompaniesAPI(clientMock);
	});

	describe("details", () => {
		it("should call client.request with the correct endpoint", async () => {
			await companiesAPI.details({ company_id: 174 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/company/174", { company_id: 174 });
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { id: 174, name: "Warner Bros. Pictures" };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await companiesAPI.details({ company_id: 174 });
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("alternative_names", () => {
		it("should call client.request with the correct endpoint", async () => {
			await companiesAPI.alternative_names({ company_id: 174 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/company/174/alternative_names", { company_id: 174 });
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { id: 174, results: [] };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await companiesAPI.alternative_names({ company_id: 174 });
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("images", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await companiesAPI.images({ company_id: 174, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/company/174/images", {
				company_id: 174,
				language: "en-US",
			});
		});

		it("should apply defaultOptions.language when no language is specified", async () => {
			companiesAPI = new CompaniesAPI(clientMock, { language: "de-DE" });
			await companiesAPI.images({ company_id: 174 });
			expect(clientMock.request).toHaveBeenCalledWith("/company/174/images", {
				company_id: 174,
				language: "de-DE",
			});
		});
	});
});
