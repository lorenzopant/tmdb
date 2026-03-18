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
		const client = new ApiClient("valid_access_token", { logger });

		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: async () => ({ id: 550 }),
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		await client.request("/movie/550", { language: "en-US" });

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

	it("should emit error logs and throw for failed calls", async () => {
		const logger = vi.fn();
		const client = new ApiClient("valid_access_token", { logger });

		const response: MockResponse = {
			ok: false,
			status: 401,
			statusText: "Unauthorized",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: async () => ({ status_message: "Invalid API key", status_code: 7 }),
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		await expect(client.request("/movie/550")).rejects.toBeInstanceOf(TMDBError);

		expect(logger).toHaveBeenCalledTimes(2);
		expect(logger.mock.calls[1][0]).toMatchObject({
			type: "error",
			method: "GET",
			endpoint: "/3/movie/550",
			tmdbStatusCode: 7,
		});
	});
});
