import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { CompaniesAPI } from "../../endpoints/companies";

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
			expect(clientMock.request).toHaveBeenCalledWith("/company/174");
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
			expect(clientMock.request).toHaveBeenCalledWith("/company/174/alternative_names");
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
				language: "en-US",
			});
		});

		it("should apply defaultOptions.language when no language is specified", async () => {
			companiesAPI = new CompaniesAPI(clientMock, { language: "de-DE" });
			await companiesAPI.images({ company_id: 174 });
			expect(clientMock.request).toHaveBeenCalledWith("/company/174/images", {
				language: "de-DE",
			});
		});

		it("should inject include_image_language from config when auto_include_image_language is enabled", async () => {
			companiesAPI = new CompaniesAPI(clientMock, {
				images: {
					auto_include_image_language: true,
					image_language_priority: { logos: ["null", "en", "*"] },
				},
			});
			await companiesAPI.images({ company_id: 174 });
			const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(params.include_image_language).toEqual(expect.arrayContaining(["null", "en"]));
			expect(params.include_image_language).not.toContain("*");
		});

		it("should not override explicit include_image_language", async () => {
			companiesAPI = new CompaniesAPI(clientMock, {
				images: { auto_include_image_language: true, image_language_priority: { logos: ["en"] } },
			});
			await companiesAPI.images({ company_id: 174, include_image_language: ["fr", "null"] });
			const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(params.include_image_language).toEqual(["fr", "null"]);
		});
	});
});
