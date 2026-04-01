import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { ConfigurationAPI } from "../../endpoints/configuration";

describe("ConfigurationAPI", () => {
	let clientMock: ApiClient;
	let configAPI: ConfigurationAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		configAPI = new ConfigurationAPI(clientMock);
	});

	describe("details", () => {
		it("should call client.request with the correct endpoint", async () => {
			await configAPI.details();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/configuration");
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { images: { base_url: "http://image.tmdb.org/t/p/" } };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await configAPI.details();
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("countries", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await configAPI.countries();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/configuration/countries", undefined);
		});

		it("should forward language param", async () => {
			await configAPI.countries({ language: "it-IT" });
			expect(clientMock.request).toHaveBeenCalledWith("/configuration/countries", {
				language: "it-IT",
			});
		});

		it("should fall back to defaultOptions.language when no param is given", async () => {
			const api = new ConfigurationAPI(clientMock, { language: "fr-FR" });
			await api.countries();
			expect(clientMock.request).toHaveBeenCalledWith("/configuration/countries", {
				language: "fr-FR",
			});
		});

		it("should let explicit param override defaultOptions.language", async () => {
			const api = new ConfigurationAPI(clientMock, { language: "fr-FR" });
			await api.countries({ language: "de-DE" });
			expect(clientMock.request).toHaveBeenCalledWith("/configuration/countries", {
				language: "de-DE",
			});
		});
	});

	describe("jobs", () => {
		it("should call client.request with the correct endpoint", async () => {
			await configAPI.jobs();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/configuration/jobs");
		});
	});

	describe("languages", () => {
		it("should call client.request with the correct endpoint", async () => {
			await configAPI.languages();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/configuration/languages");
		});
	});

	describe("primary_translations", () => {
		it("should call client.request with the correct endpoint", async () => {
			await configAPI.primary_translations();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/configuration/primary_translations");
		});
	});

	describe("timezones", () => {
		it("should call client.request with the correct endpoint", async () => {
			await configAPI.timezones();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/configuration/timezones");
		});
	});
});
