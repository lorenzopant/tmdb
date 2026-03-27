import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { PeopleAPI } from "../../endpoints/people";

describe("PeopleAPI", () => {
	let clientMock: ApiClient;
	let peopleAPI: PeopleAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		peopleAPI = new PeopleAPI(clientMock);
	});

	describe("details", () => {
		it("should call client.request with correct endpoint and language", async () => {
			await peopleAPI.details({ person_id: 31, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/person/31", { language: "en-US" });
		});

		it("should pass append_to_response when specified", async () => {
			await peopleAPI.details({ person_id: 31, append_to_response: ["images", "external_ids"] });
			expect(clientMock.request).toHaveBeenCalledWith("/person/31", {
				language: undefined,
				append_to_response: ["images", "external_ids"],
			});
		});

		it("should use defaultOptions.language when not provided", async () => {
			peopleAPI = new PeopleAPI(clientMock, { language: "it-IT" });
			await peopleAPI.details({ person_id: 31 });
			expect(clientMock.request).toHaveBeenCalledWith("/person/31", expect.objectContaining({ language: "it-IT" }));
		});
	});

	describe("changes", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await peopleAPI.changes({ person_id: 31, page: 2, start_date: "2024-01-01", end_date: "2024-01-14" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/person/31/changes", {
				page: 2,
				start_date: "2024-01-01",
				end_date: "2024-01-14",
			});
		});
	});

	describe("combined_credits", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await peopleAPI.combined_credits({ person_id: 31, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/person/31/combined_credits", { language: "en-US" });
		});

		it("should use defaultOptions.language when not provided", async () => {
			peopleAPI = new PeopleAPI(clientMock, { language: "fr-FR" });
			await peopleAPI.combined_credits({ person_id: 31 });
			expect(clientMock.request).toHaveBeenCalledWith("/person/31/combined_credits", { language: "fr-FR" });
		});
	});

	describe("external_ids", () => {
		it("should call client.request with the correct endpoint", async () => {
			await peopleAPI.external_ids({ person_id: 31 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/person/31/external_ids");
		});
	});

	describe("images", () => {
		it("should call client.request with the correct endpoint", async () => {
			await peopleAPI.images({ person_id: 31 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/person/31/images");
		});
	});

	describe("latest", () => {
		it("should call client.request with the correct endpoint", async () => {
			await peopleAPI.latest();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/person/latest");
		});
	});

	describe("movie_credits", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await peopleAPI.movie_credits({ person_id: 31, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/person/31/movie_credits", { language: "en-US" });
		});

		it("should use defaultOptions.language when not provided", async () => {
			peopleAPI = new PeopleAPI(clientMock, { language: "es-ES" });
			await peopleAPI.movie_credits({ person_id: 31 });
			expect(clientMock.request).toHaveBeenCalledWith("/person/31/movie_credits", { language: "es-ES" });
		});
	});

	describe("tagged_images", () => {
		it("should call client.request with the correct endpoint and params", async () => {
			await peopleAPI.tagged_images({ person_id: 31, page: 2 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/person/31/tagged_images", { page: 2 });
		});
	});

	describe("translations", () => {
		it("should call client.request with the correct endpoint", async () => {
			await peopleAPI.translations({ person_id: 31 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/person/31/translations");
		});
	});

	describe("tv_credits", () => {
		it("should call client.request with the correct endpoint and language", async () => {
			await peopleAPI.tv_credits({ person_id: 31, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/person/31/tv_credits", { language: "en-US" });
		});

		it("should use defaultOptions.language when not provided", async () => {
			peopleAPI = new PeopleAPI(clientMock, { language: "de-DE" });
			await peopleAPI.tv_credits({ person_id: 31 });
			expect(clientMock.request).toHaveBeenCalledWith("/person/31/tv_credits", { language: "de-DE" });
		});
	});
});
