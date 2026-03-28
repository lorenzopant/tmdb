import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { TMDBError } from "../../errors/tmdb";

type MockResponse = {
	ok: boolean;
	status: number;
	statusText: string;
	url: string;
	headers: { get: (key: string) => string | null };
	json: () => Promise<unknown>;
};

const makeHeaders = (values: Record<string, string | null>) => ({
	get: (key: string) => values[key.toLowerCase()] ?? values[key] ?? null,
});

// Hardcoded mock JWT — fetch is fully mocked, so a real token is not needed
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwfQ.signature";

describe("ApiClient logger", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("should emit request and response logs for successful calls", async () => {
		const logger = vi.fn();
		const client = new ApiClient(token, { logger });

		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: async () => ({
				id: 550,
				nullField: null,
				nested: { also_null: null, value: 42 },
				list: [null, "text", 1],
			}),
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		const result = await client.request<Record<string, unknown>>("/movie/550", { language: "en-US" });

		expect(result.nullField).toBeUndefined();
		expect((result.nested as Record<string, unknown>).also_null).toBeUndefined();
		expect((result.list as unknown[])[0]).toBeUndefined();
		expect((result.list as unknown[])[1]).toBe("text");
		expect(logger).toHaveBeenCalledTimes(2);
		expect(logger.mock.calls[0][0]).toMatchObject({
			type: "request",
			method: "GET",
			endpoint: "/movie/550",
		});
		expect(logger.mock.calls[1][0]).toMatchObject({
			type: "response",
			method: "GET",
			endpoint: "/movie/550",
			status: 200,
		});
	});

	it("should sanitize a primitive JSON response", async () => {
		const client = new ApiClient(token);

		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/test",
			headers: makeHeaders({}),
			json: async () => 42,
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);
		const result = await client.request<number>("/test");
		expect(result).toBe(42);
	});

	it("should sanitize a null JSON response to undefined", async () => {
		const client = new ApiClient(token);

		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/test",
			headers: makeHeaders({}),
			json: async () => null,
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);
		const result = await client.request<null>("/test");
		expect(result).toBeUndefined();
	});

	it("should emit error log and rethrow when fetch throws a network error", async () => {
		const logger = vi.fn();
		const client = new ApiClient(token, { logger });

		const networkError = new Error("Network failure");
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(networkError);

		await expect(client.request("/movie/550")).rejects.toThrow("Network failure");

		expect(logger).toHaveBeenCalledTimes(2);
		expect(logger.mock.calls[1][0]).toMatchObject({
			type: "error",
			method: "GET",
			endpoint: "/movie/550",
			errorMessage: "Network failure",
		});
	});

	it("should stringify non-Error thrown values in the network error log", async () => {
		const logger = vi.fn();
		const client = new ApiClient(token, { logger });

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue("plain string error");

		await expect(client.request("/movie/1")).rejects.toBe("plain string error");

		expect(logger.mock.calls[1][0]).toMatchObject({
			type: "error",
			method: "GET",
			endpoint: "/movie/1",
			errorMessage: "plain string error",
		});
	});

	it("should fall back to statusText when error response body is not valid JSON", async () => {
		const logger = vi.fn();
		const client = new ApiClient(token, { logger });
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const response: MockResponse = {
			ok: false,
			status: 503,
			statusText: "Service Unavailable",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: async () => {
				throw new SyntaxError("Unexpected token");
			},
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		const err = await client.request("/movie/550").catch((e: unknown) => e);
		expect(err).toBeInstanceOf(TMDBError);
		expect(errorSpy).toHaveBeenCalledOnce();
		expect(logger.mock.calls[1][0]).toMatchObject({
			type: "error",
			method: "GET",
			endpoint: "/movie/550",
			status: 503,
			statusText: "Service Unavailable",
		});
	});

	it("should skip undefined param values when building the URL", async () => {
		const client = new ApiClient(token);

		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/test",
			headers: makeHeaders({}),
			json: async () => ({}),
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		await client.request("/test", { defined: "yes", skipped: undefined });

		const calledUrl: string = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
		expect(calledUrl).toContain("defined=yes");
		expect(calledUrl).not.toContain("skipped");
	});

	it("should serialize array param values consistently in the URL", async () => {
		const client = new ApiClient(token);

		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/test",
			headers: makeHeaders({}),
			json: async () => ({}),
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		await client.request("/test", {
			language: "en-US",
			include_image_language: ["en", "null"],
		});

		const calledUrl = new URL((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string);
		expect(calledUrl.searchParams.get("language")).toBe("en-US");
		expect(calledUrl.searchParams.get("include_image_language")).toBe("en,null");
	});

	it("should fall back to statusText when error body is a non-object JSON value", async () => {
		const client = new ApiClient(token);

		const response: MockResponse = {
			ok: false,
			status: 422,
			statusText: "Unprocessable Entity",
			url: "https://api.themoviedb.org/3/test",
			headers: makeHeaders({}),
			json: async () => null,
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		const err = await client.request("/test").catch((e: unknown) => e);
		expect(err).toBeInstanceOf(TMDBError);
		expect((err as TMDBError).message).toBe("Unprocessable Entity");
	});

	it("should fall back to statusText and -1 when error body has no status_message or status_code", async () => {
		const client = new ApiClient(token);

		const response: MockResponse = {
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
			url: "https://api.themoviedb.org/3/test",
			headers: makeHeaders({}),
			json: async () => ({}),
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		const err = await client.request("/test").catch((e: unknown) => e);
		expect(err).toBeInstanceOf(TMDBError);
		expect((err as TMDBError).message).toBe("Internal Server Error");
	});
});
