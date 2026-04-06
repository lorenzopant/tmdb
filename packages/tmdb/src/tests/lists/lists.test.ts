import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../client";
import { ListsAPI } from "../../endpoints/lists";

describe("ListsAPI", () => {
	let clientMock: ApiClient;
	let api: ListsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		clientMock.mutate = vi.fn();
		api = new ListsAPI(clientMock);
	});

	describe("details", () => {
		it("should call client.request with correct endpoint and params", async () => {
			await api.details({ list_id: 1 });
			expect(clientMock.request).toHaveBeenCalledWith("/list/1", { language: undefined });
		});

		it("should pass language param when provided", async () => {
			await api.details({ list_id: 1, language: "en-US" });
			expect(clientMock.request).toHaveBeenCalledWith("/list/1", { language: "en-US" });
		});

		it("should pass page param", async () => {
			await api.details({ list_id: 1, page: 2 });
			expect(clientMock.request).toHaveBeenCalledWith("/list/1", { language: undefined, page: 2 });
		});

		it("should use defaultOptions.language when no language param", async () => {
			api = new ListsAPI(clientMock, { language: "fr-FR" });
			await api.details({ list_id: 1 });
			expect(clientMock.request).toHaveBeenCalledWith("/list/1", expect.objectContaining({ language: "fr-FR" }));
		});

		it("should return the result from client.request", async () => {
			const mockData = {
				id: "1",
				name: "Test List",
				items: [],
				item_count: 0,
				created_by: "user",
				description: "",
				favorite_count: 0,
				iso_639_1: "en",
				poster_path: null,
			};
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.details({ list_id: 1 });
			expect(result).toEqual(mockData);
		});
	});

	describe("create", () => {
		it("should call client.mutate with correct endpoint and body", async () => {
			await api.create({ session_id: "sess123" }, { name: "My List", description: "A list", language: "en" });
			expect(clientMock.mutate).toHaveBeenCalledWith(
				"POST",
				"/list",
				{ name: "My List", description: "A list", language: "en" },
				{ session_id: "sess123" },
			);
		});

		it("should return the result from client.mutate", async () => {
			const mockData = { status_message: "The item/record was created successfully.", success: true, status_code: 1, list_id: 5861 };
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.create({ session_id: "sess123" }, { name: "My List", description: "", language: "en" });
			expect(result).toEqual(mockData);
		});
	});

	describe("delete", () => {
		it("should call client.mutate with correct endpoint", async () => {
			await api.delete({ list_id: 42, session_id: "sess123" });
			expect(clientMock.mutate).toHaveBeenCalledWith("DELETE", "/list/42", undefined, { session_id: "sess123" });
		});

		it("should return the result from client.mutate", async () => {
			const mockData = { status_code: 12, status_message: "The item/record was updated successfully." };
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.delete({ list_id: 42, session_id: "sess123" });
			expect(result).toEqual(mockData);
		});
	});

	describe("add_movie", () => {
		it("should call client.mutate with correct endpoint and body", async () => {
			await api.add_movie({ list_id: 42, session_id: "sess123" }, { media_id: 550 });
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/list/42/add_item", { media_id: 550 }, { session_id: "sess123" });
		});

		it("should return the result from client.mutate", async () => {
			const mockData = { status_code: 12, status_message: "The item/record was updated successfully." };
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.add_movie({ list_id: 42, session_id: "sess123" }, { media_id: 550 });
			expect(result).toEqual(mockData);
		});
	});

	describe("remove_movie", () => {
		it("should call client.mutate with correct endpoint and body", async () => {
			await api.remove_movie({ list_id: 42, session_id: "sess123" }, { media_id: 550 });
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/list/42/remove_item", { media_id: 550 }, { session_id: "sess123" });
		});

		it("should return the result from client.mutate", async () => {
			const mockData = { status_code: 13, status_message: "The item/record was deleted successfully." };
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.remove_movie({ list_id: 42, session_id: "sess123" }, { media_id: 550 });
			expect(result).toEqual(mockData);
		});
	});

	describe("check_item_status", () => {
		it("should call client.request with correct endpoint", async () => {
			await api.check_item_status({ list_id: 1, movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledWith("/list/1/item_status", {
				language: undefined,
				movie_id: 550,
			});
		});

		it("should pass language param when provided", async () => {
			await api.check_item_status({ list_id: 1, movie_id: 550, language: "de-DE" });
			expect(clientMock.request).toHaveBeenCalledWith("/list/1/item_status", {
				language: "de-DE",
				movie_id: 550,
			});
		});

		it("should work without movie_id", async () => {
			await api.check_item_status({ list_id: 1 });
			expect(clientMock.request).toHaveBeenCalledWith("/list/1/item_status", { language: undefined });
		});

		it("should return the result from client.request", async () => {
			const mockData = { id: 1, item_present: true };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.check_item_status({ list_id: 1, movie_id: 550 });
			expect(result).toEqual(mockData);
		});
	});

	describe("clear", () => {
		it("should call client.mutate with correct endpoint and query params", async () => {
			await api.clear({ list_id: 42, session_id: "sess123", confirm: true });
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/list/42/clear", undefined, { session_id: "sess123", confirm: true });
		});

		it("should pass confirm: false correctly", async () => {
			await api.clear({ list_id: 42, session_id: "sess123", confirm: false });
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/list/42/clear", undefined, { session_id: "sess123", confirm: false });
		});

		it("should return the result from client.mutate", async () => {
			const mockData = { status_code: 12, status_message: "The item/record was updated successfully." };
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
			const result = await api.clear({ list_id: 42, session_id: "sess123", confirm: true });
			expect(result).toEqual(mockData);
		});
	});
});
