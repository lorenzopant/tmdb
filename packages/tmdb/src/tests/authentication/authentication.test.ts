import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { AuthenticationAPI } from "../../endpoints/authentication";
import { TMDBError } from "../../errors/tmdb";
import type {
	AuthCreateSessionResponse,
	AuthDeleteSessionResponse,
	AuthGuestSessionResponse,
	AuthRequestTokenResponse,
	AuthValidateKeyResponse,
} from "../../types/authentication";

describe("AuthenticationAPI", () => {
	let clientMock: ApiClient;
	let api: AuthenticationAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		clientMock.mutate = vi.fn();
		api = new AuthenticationAPI(clientMock);
	});

	// MARK: validate_key

	describe("validate_key", () => {
		it("should call client.request with the correct endpoint", async () => {
			await api.validate_key();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/authentication");
		});

		it("should return the result from client.request", async () => {
			const mockResponse: AuthValidateKeyResponse = {
				success: true,
				status_code: 1,
				status_message: "Success.",
			};
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.validate_key();
			expect(result).toEqual(mockResponse);
		});

		it("should propagate TMDBError on 401 (invalid credentials)", async () => {
			const error = new TMDBError("Invalid API key: You must be granted a valid key.", 401, 7);
			(clientMock.request as ReturnType<typeof vi.fn>).mockRejectedValue(error);
			await expect(api.validate_key()).rejects.toMatchObject({
				http_status_code: 401,
				tmdb_status_code: 7,
			});
		});
	});

	// MARK: create_guest_session

	describe("create_guest_session", () => {
		it("should call client.request with the correct endpoint", async () => {
			await api.create_guest_session();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/authentication/guest_session/new");
		});

		it("should return the result from client.request", async () => {
			const mockResponse: AuthGuestSessionResponse = {
				success: true,
				guest_session_id: "1ce82ec1223641636ad4a60b07de3581",
				expires_at: "2016-08-27 16:26:40 UTC",
			};
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.create_guest_session();
			expect(result).toEqual(mockResponse);
		});

		it("should propagate TMDBError on 401", async () => {
			const error = new TMDBError("Authentication failed.", 401, 3);
			(clientMock.request as ReturnType<typeof vi.fn>).mockRejectedValue(error);
			await expect(api.create_guest_session()).rejects.toMatchObject({
				http_status_code: 401,
				tmdb_status_code: 3,
			});
		});
	});

	// MARK: create_request_token

	describe("create_request_token", () => {
		it("should call client.request with the correct endpoint", async () => {
			await api.create_request_token();
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/authentication/token/new");
		});

		it("should return the result from client.request", async () => {
			const mockResponse: AuthRequestTokenResponse = {
				success: true,
				expires_at: "2016-08-26 17:04:39 UTC",
				request_token: "ff5c7eeb5a8870efe3cd7fc5c282cffd26800ecd",
			};
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.create_request_token();
			expect(result).toEqual(mockResponse);
		});

		it("should propagate TMDBError on 401", async () => {
			const error = new TMDBError("Authentication failed.", 401, 3);
			(clientMock.request as ReturnType<typeof vi.fn>).mockRejectedValue(error);
			await expect(api.create_request_token()).rejects.toMatchObject({
				http_status_code: 401,
				tmdb_status_code: 3,
			});
		});
	});

	// MARK: create_session

	describe("create_session", () => {
		it("should call client.mutate with correct endpoint and body", async () => {
			await api.create_session({ request_token: "approved_token_abc" });
			expect(clientMock.mutate).toHaveBeenCalledOnce();
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/authentication/session/new", {
				request_token: "approved_token_abc",
			});
		});

		it("should return the result from client.mutate", async () => {
			const mockResponse: AuthCreateSessionResponse = {
				success: true,
				session_id: "79191836ddaa0da3df76a5ffef6f07ad6ab0c641",
			};
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.create_session({ request_token: "approved_token_abc" });
			expect(result).toEqual(mockResponse);
		});

		it("should propagate TMDBError on 401 (invalid/unapproved token)", async () => {
			const error = new TMDBError("Invalid request token.", 401, 33);
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockRejectedValue(error);
			await expect(api.create_session({ request_token: "bad_token" })).rejects.toMatchObject({
				http_status_code: 401,
				tmdb_status_code: 33,
			});
		});

		it("should propagate generic network errors", async () => {
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockRejectedValue(new TypeError("Failed to fetch"));
			await expect(api.create_session({ request_token: "approved_token_abc" })).rejects.toThrow("Failed to fetch");
		});
	});

	// MARK: create_session_with_login

	describe("create_session_with_login", () => {
		const body = {
			username: "johndoe",
			password: "secret",
			request_token: "ff5c7eeb5a8870efe3cd7fc5c282cffd26800ecd",
		};

		it("should call client.mutate with correct endpoint and body", async () => {
			await api.create_session_with_login(body);
			expect(clientMock.mutate).toHaveBeenCalledOnce();
			expect(clientMock.mutate).toHaveBeenCalledWith("POST", "/authentication/token/validate_with_login", body);
		});

		it("should return the validated request token from client.mutate", async () => {
			const mockResponse: AuthRequestTokenResponse = {
				success: true,
				expires_at: "2018-07-24 04:10:26 UTC",
				request_token: "1531f1a558c8357ce8990cf887ff196e8f5402ec",
			};
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.create_session_with_login(body);
			expect(result).toEqual(mockResponse);
		});

		it("should propagate TMDBError on 401 (invalid credentials)", async () => {
			const error = new TMDBError("Invalid username and/or password.", 401, 30);
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockRejectedValue(error);
			await expect(api.create_session_with_login(body)).rejects.toMatchObject({
				http_status_code: 401,
				tmdb_status_code: 30,
			});
		});

		it("should propagate TMDBError on 404 (invalid request token)", async () => {
			const error = new TMDBError("The resource you requested could not be found.", 404, 34);
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockRejectedValue(error);
			await expect(api.create_session_with_login(body)).rejects.toMatchObject({
				http_status_code: 404,
				tmdb_status_code: 34,
			});
		});
	});

	// MARK: delete_session

	describe("delete_session", () => {
		it("should call client.mutate with correct endpoint and body", async () => {
			await api.delete_session({ session_id: "79191836ddaa0da3df76a5ffef6f07ad6ab0c641" });
			expect(clientMock.mutate).toHaveBeenCalledOnce();
			expect(clientMock.mutate).toHaveBeenCalledWith("DELETE", "/authentication/session", {
				session_id: "79191836ddaa0da3df76a5ffef6f07ad6ab0c641",
			});
		});

		it("should return the result from client.mutate", async () => {
			const mockResponse: AuthDeleteSessionResponse = { success: true };
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
			const result = await api.delete_session({
				session_id: "79191836ddaa0da3df76a5ffef6f07ad6ab0c641",
			});
			expect(result).toEqual(mockResponse);
		});

		it("should propagate TMDBError on 401", async () => {
			const error = new TMDBError("Authentication failed.", 401, 3);
			(clientMock.mutate as ReturnType<typeof vi.fn>).mockRejectedValue(error);
			await expect(api.delete_session({ session_id: "invalid" })).rejects.toMatchObject({
				http_status_code: 401,
				tmdb_status_code: 3,
			});
		});
	});
});
