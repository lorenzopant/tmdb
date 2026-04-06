import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { V4ListsAPI } from "../../endpoints/v4/lists";
import { TMDBError } from "../../errors/tmdb";
import type {
	V4AddListItemsResponse,
	V4CreateListResponse,
	V4ListDetails,
	V4ListItemStatusResponse,
	V4ListStatusResponse,
} from "../../types/v4/lists";

const STATUS_OK: V4ListStatusResponse = {
	success: true,
	status_code: 1,
	status_message: "Success.",
};

describe("V4ListsAPI", () => {
	let clientMock: ApiClient;
	let api: V4ListsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.mutate = vi.fn();
		clientMock.request = vi.fn();
		api = new V4ListsAPI(clientMock);
	});

	// MARK: create

	describe("create", () => {
		it("should call client.mutate with POST /list and the body", async () => {
			await api.create({ name: "My List", iso_639_1: "en" });
			expect(clientMock.mutate).toHaveBeenCalledOnce();
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/list", { name: "My List", iso_639_1: "en" });
		});

		it("should include optional fields in the body", async () => {
			await api.create({ name: "My List", iso_639_1: "en", description: "desc", public: false });
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/list", {
				name: "My List",
				iso_639_1: "en",
				description: "desc",
				public: false,
			});
		});

		it("should return the response from client.mutate", async () => {
			const mockResponse: V4CreateListResponse = { success: true, status_code: 1, status_message: "Success.", id: 8700 };
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.create({ name: "My List", iso_639_1: "en" });
			expect(result).toEqual(mockResponse);
		});

		it("should propagate TMDBError on failure", async () => {
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockRejectedValue(new TMDBError("Unauthorized.", 401, 3));
			await expect(api.create({ name: "x", iso_639_1: "en" })).rejects.toMatchObject({
				http_status_code: 401,
				tmdb_status_code: 3,
			});
		});
	});

	// MARK: details

	describe("details", () => {
		it("should call client.request with the correct path and params", async () => {
			await api.details({ list_id: 8700 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/list/8700", {});
		});

		it("should pass language and page to the request", async () => {
			await api.details({ list_id: 8700, language: "fr-FR", page: 2 });
			expect(clientMock.request).toHaveBeenCalledWith("/list/8700", { language: "fr-FR", page: 2 });
		});

		it("should return the response from client.request", async () => {
			const mockDetails: V4ListDetails = {
				id: 8700,
				name: "My List",
				description: "",
				created_by: "user123",
				backdrop_path: null,
				poster_path: null,
				public: true,
				iso_639_1: "en",
				iso_3166_1: "US",
				item_count: 1,
				average_rating: 7.5,
				runtime: 120,
				sort_by: "original_order.asc",
				revenue: 0,
				comments: {},
				object_ids: {},
				page: 1,
				total_pages: 1,
				total_results: 1,
				results: [],
			};
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockDetails);
			const result = await api.details({ list_id: 8700 });
			expect(result).toEqual(mockDetails);
		});
	});

	// MARK: update

	describe("update", () => {
		it("should call client.mutate with PUT /list/{id} and the fields", async () => {
			await api.update({ list_id: 8700, name: "New Name" });
			expect(clientMock.mutate).toHaveBeenCalledOnce();
			expect(clientMock.mutate).toHaveBeenCalledWith("PUT", "/list/8700", { name: "New Name" });
		});

		it("should return the response from client.mutate", async () => {
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(STATUS_OK);
			const result = await api.update({ list_id: 8700, description: "updated" });
			expect(result).toEqual(STATUS_OK);
		});

		it("should propagate TMDBError on failure", async () => {
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockRejectedValue(new TMDBError("Not found.", 404, 34));
			await expect(api.update({ list_id: 9999, name: "x" })).rejects.toMatchObject({
				http_status_code: 404,
			});
		});
	});

	// MARK: delete

	describe("delete", () => {
		it("should call client.mutate with DELETE /list/{id}", async () => {
			await api.delete({ list_id: 8700 });
			expect(clientMock.mutate).toHaveBeenCalledOnce();
			expect(clientMock.mutate).toHaveBeenCalledWith("DELETE", "/list/8700", {});
		});

		it("should return the response from client.mutate", async () => {
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(STATUS_OK);
			const result = await api.delete({ list_id: 8700 });
			expect(result).toEqual(STATUS_OK);
		});
	});

	// MARK: add_items

	describe("add_items", () => {
		const items = [{ media_type: "movie" as const, media_id: 550 }];

		it("should call client.mutate with POST /list/{id}/items and the body", async () => {
			await api.add_items(8700, { items });
			expect(clientMock.mutate).toHaveBeenCalledOnce();
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/list/8700/items", { items });
		});

		it("should return the response from client.mutate", async () => {
			const mockResponse: V4AddListItemsResponse = {
				...STATUS_OK,
				results: [{ success: true, media_type: "movie", media_id: 550 }],
			};
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.add_items(8700, { items });
			expect(result).toEqual(mockResponse);
		});

		it("should propagate TMDBError on failure", async () => {
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockRejectedValue(new TMDBError("Unauthorized.", 401, 3));
			await expect(api.add_items(8700, { items })).rejects.toMatchObject({ http_status_code: 401 });
		});
	});

	// MARK: update_items

	describe("update_items", () => {
		it("should call client.mutate with PUT /list/{id}/items", async () => {
			const items = [{ media_type: "tv" as const, media_id: 1396, comment: "Great show" }];
			await api.update_items(8700, { items });
			expect(clientMock.mutate).toHaveBeenCalledWith("PUT", "/list/8700/items", { items });
		});
	});

	// MARK: remove_items

	describe("remove_items", () => {
		it("should call client.mutate with DELETE /list/{id}/items", async () => {
			const items = [{ media_type: "movie" as const, media_id: 550 }];
			await api.remove_items(8700, { items });
			expect(clientMock.mutate).toHaveBeenCalledWith("DELETE", "/list/8700/items", { items });
		});

		it("should return the status response", async () => {
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(STATUS_OK);
			const result = await api.remove_items(8700, { items: [{ media_type: "movie", media_id: 550 }] });
			expect(result).toEqual(STATUS_OK);
		});
	});

	// MARK: item_status

	describe("item_status", () => {
		it("should call client.request with /list/{id}/item_status and query params", async () => {
			await api.item_status({ list_id: 8700, media_type: "movie", media_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/list/8700/item_status", {
				media_type: "movie",
				media_id: 550,
			});
		});

		it("should return the response from client.request", async () => {
			const mockResponse: V4ListItemStatusResponse = { id: 8700, media_type: "movie", media_id: 550 };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.item_status({ list_id: 8700, media_type: "movie", media_id: 550 });
			expect(result).toEqual(mockResponse);
		});
	});

	// MARK: clear

	describe("clear", () => {
		it("should call client.request with GET /list/{id}/clear", async () => {
			await api.clear(8700);
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/list/8700/clear");
		});

		it("should return the status response", async () => {
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(STATUS_OK);
			const result = await api.clear(8700);
			expect(result).toEqual(STATUS_OK);
		});
	});
});
