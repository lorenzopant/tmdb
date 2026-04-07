import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { CollectionsAPI } from "../../endpoints/collections";

describe("CollectionsAPI", () => {
	let clientMock: ApiClient;
	let collectionsAPI: CollectionsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		collectionsAPI = new CollectionsAPI(clientMock);
	});

	describe("details", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await collectionsAPI.details({ collection_id: 10, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/collection/10", {
				language: "en-US",
			});
		});

		it("should work without optional language param", async () => {
			await collectionsAPI.details({ collection_id: 10 });
			expect(clientMock.request).toHaveBeenCalledWith("/collection/10", {
				language: undefined,
			});
		});

		it("should use defaultOptions.language when no language param is provided", async () => {
			collectionsAPI = new CollectionsAPI(clientMock, { language: "fr-FR" });
			await collectionsAPI.details({ collection_id: 10 });
			expect(clientMock.request).toHaveBeenCalledWith("/collection/10", {
				language: "fr-FR",
			});
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { id: 10, name: "Star Wars Collection", parts: [] };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await collectionsAPI.details({ collection_id: 10 });
			expect(result).toEqual(fakeResponse);
		});
	});

	describe("images", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await collectionsAPI.images({ collection_id: 10, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/collection/10/images", {
				language: "en-US",
			});
		});

		it("should apply defaultOptions.language when no language is specified", async () => {
			collectionsAPI = new CollectionsAPI(clientMock, { language: "it-IT" });
			await collectionsAPI.images({ collection_id: 10 });
			expect(clientMock.request).toHaveBeenCalledWith("/collection/10/images", {
				language: "it-IT",
			});
		});

		it("should inject include_image_language from config when auto_include_image_language is enabled", async () => {
			collectionsAPI = new CollectionsAPI(clientMock, {
				images: {
					auto_include_image_language: true,
					image_language_priority: { posters: ["null", "en", "*"] },
				},
			});
			await collectionsAPI.images({ collection_id: 10 });
			const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(params.include_image_language).toEqual(expect.arrayContaining(["null", "en"]));
			expect(params.include_image_language).not.toContain("*");
		});

		it("should not override explicit include_image_language", async () => {
			collectionsAPI = new CollectionsAPI(clientMock, {
				images: { auto_include_image_language: true, image_language_priority: { posters: ["en"] } },
			});
			await collectionsAPI.images({ collection_id: 10, include_image_language: ["fr", "null"] });
			const [, params] = (clientMock.request as ReturnType<typeof vi.fn>).mock.calls[0];
			expect(params.include_image_language).toEqual(["fr", "null"]);
		});
	});

	describe("translations", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await collectionsAPI.translations({ collection_id: 10 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/collection/10/translations");
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { id: 10, translations: [] };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await collectionsAPI.translations({ collection_id: 10 });
			expect(result).toEqual(fakeResponse);
		});
	});
});
