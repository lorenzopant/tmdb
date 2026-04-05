import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { V4AuthAPI } from "../../endpoints/v4/auth";
import { TMDBError } from "../../errors/tmdb";
import type { V4AuthAccessTokenResponse, V4AuthDeleteAccessTokenResponse, V4AuthRequestTokenResponse } from "../../types/v4/auth";

describe("V4AuthAPI", () => {
	let clientMock: ApiClient;
	let api: V4AuthAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.mutate = vi.fn();
		api = new V4AuthAPI(clientMock);
	});

	// MARK: create_request_token

	describe("create_request_token", () => {
		it("should call client.mutate with POST and the correct endpoint", async () => {
			await api.create_request_token();
			expect(clientMock.mutate).toHaveBeenCalledOnce();
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/auth/request_token", {});
		});

		it("should pass redirect_to in body when provided", async () => {
			await api.create_request_token({ redirect_to: "https://myapp.com/callback" });
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/auth/request_token", {
				redirect_to: "https://myapp.com/callback",
			});
		});

		it("should return the result from client.mutate", async () => {
			const mockResponse: V4AuthRequestTokenResponse = {
				success: true,
				request_token: "abcdef1234567890",
			};
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.create_request_token();
			expect(result).toEqual(mockResponse);
		});

		it("should propagate TMDBError on failure", async () => {
			const error = new TMDBError("Invalid API key.", 401, 7);
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockRejectedValue(error);
			await expect(api.create_request_token()).rejects.toMatchObject({
				http_status_code: 401,
				tmdb_status_code: 7,
			});
		});
	});

	// MARK: create_access_token

	describe("create_access_token", () => {
		it("should call client.mutate with POST and the correct endpoint", async () => {
			await api.create_access_token({ request_token: "abcdef1234567890" });
			expect(clientMock.mutate).toHaveBeenCalledOnce();
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/auth/access_token", {
				request_token: "abcdef1234567890",
			});
		});

		it("should return the result from client.mutate", async () => {
			const mockResponse: V4AuthAccessTokenResponse = {
				success: true,
				access_token: "eyJhbGciOiJIUzI1NiJ9.usertoken",
				account_id: "abc123def456",
			};
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.create_access_token({ request_token: "abcdef1234567890" });
			expect(result).toEqual(mockResponse);
		});

		it("should propagate TMDBError when the request token was not approved", async () => {
			const error = new TMDBError("Invalid request token.", 401, 3);
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockRejectedValue(error);
			await expect(api.create_access_token({ request_token: "invalid" })).rejects.toMatchObject({
				http_status_code: 401,
				tmdb_status_code: 3,
			});
		});
	});

	// MARK: delete_access_token

	describe("delete_access_token", () => {
		it("should call client.mutate with DELETE and the correct endpoint", async () => {
			await api.delete_access_token({ access_token: "eyJhbGciOiJIUzI1NiJ9.usertoken" });
			expect(clientMock.mutate).toHaveBeenCalledOnce();
			expect(clientMock.mutate).toHaveBeenCalledWith("DELETE", "/auth/access_token", {
				access_token: "eyJhbGciOiJIUzI1NiJ9.usertoken",
			});
		});

		it("should return the result from client.mutate", async () => {
			const mockResponse: V4AuthDeleteAccessTokenResponse = {
				success: true,
				status_code: 32,
				status_message: "The item/record was updated successfully.",
			};
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.delete_access_token({ access_token: "eyJhbGciOiJIUzI1NiJ9.usertoken" });
			expect(result).toEqual(mockResponse);
		});

		it("should propagate TMDBError on invalid access token", async () => {
			const error = new TMDBError("Authentication failed.", 401, 3);
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockRejectedValue(error);
			await expect(api.delete_access_token({ access_token: "invalid" })).rejects.toMatchObject({
				http_status_code: 401,
				tmdb_status_code: 3,
			});
		});
	});
});
