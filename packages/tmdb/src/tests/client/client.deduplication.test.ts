import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";

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

describe("ApiClient deduplication", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("makes only one fetch call when the same request is fired concurrently", async () => {
		const client = new ApiClient(token);

		let resolveJson!: (value: unknown) => void;
		const jsonPromise = new Promise((resolve) => {
			resolveJson = resolve;
		});

		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: () => jsonPromise,
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		const [result1, result2, result3] = await Promise.all([
			client.request("/movie/550", { language: "en-US" }),
			client.request("/movie/550", { language: "en-US" }),
			client.request("/movie/550", { language: "en-US" }),
			// Resolve the shared json() promise after all requests are registered
			(async () => {
				resolveJson({ id: 550 });
			})(),
		]).then(([r1, r2, r3]) => [r1, r2, r3]);

		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		expect(result1).toEqual({ id: 550 });
		expect(result2).toEqual({ id: 550 });
		expect(result3).toEqual({ id: 550 });
	});

	it("makes separate fetch calls for different endpoints", async () => {
		const client = new ApiClient(token);

		const makeResponse = (id: number): MockResponse => ({
			ok: true,
			status: 200,
			statusText: "OK",
			url: `https://api.themoviedb.org/3/movie/${id}`,
			headers: makeHeaders({}),
			json: async () => ({ id }),
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse(550)).mockResolvedValueOnce(makeResponse(551));

		const [r1, r2] = await Promise.all([
			client.request("/movie/550", { language: "en-US" }),
			client.request("/movie/551", { language: "en-US" }),
		]);

		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
		expect(r1).toEqual({ id: 550 });
		expect(r2).toEqual({ id: 551 });
	});

	it("makes separate fetch calls for same endpoint with different params", async () => {
		const client = new ApiClient(token);

		const makeResponse = (lang: string): MockResponse => ({
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: async () => ({ language: lang }),
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse("en-US"))
			.mockResolvedValueOnce(makeResponse("it-IT"));

		const [r1, r2] = await Promise.all([
			client.request("/movie/550", { language: "en-US" }),
			client.request("/movie/550", { language: "it-IT" }),
		]);

		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
		expect(r1).toEqual({ language: "en-US" });
		expect(r2).toEqual({ language: "it-IT" });
	});

	it("treats params with different key order as the same request", async () => {
		const client = new ApiClient(token);

		let resolveJson!: (value: unknown) => void;
		const jsonPromise = new Promise((resolve) => {
			resolveJson = resolve;
		});

		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: () => jsonPromise,
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		const [r1, r2] = await Promise.all([
			client.request("/movie/550", { language: "en-US", page: 1 }),
			client.request("/movie/550", { page: 1, language: "en-US" }),
			(async () => {
				resolveJson({ id: 550 });
			})(),
		]).then(([a, b]) => [a, b]);

		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		expect(r1).toEqual({ id: 550 });
		expect(r2).toEqual({ id: 550 });
	});

	it("allows a second request after the first one completes", async () => {
		const client = new ApiClient(token);

		const makeResponse = (): MockResponse => ({
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: async () => ({ id: 550 }),
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse()).mockResolvedValueOnce(makeResponse());

		await client.request("/movie/550", { language: "en-US" });
		await client.request("/movie/550", { language: "en-US" });

		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
	});

	it("deduplicates requests that fail, propagating the error to all callers", async () => {
		const client = new ApiClient(token);

		let rejectJson!: (reason: unknown) => void;
		const jsonPromise = new Promise<unknown>((_, reject) => {
			rejectJson = reject;
		});

		const response: MockResponse = {
			ok: false,
			status: 404,
			statusText: "Not Found",
			url: "https://api.themoviedb.org/3/movie/9999",
			headers: makeHeaders({}),
			json: () => jsonPromise,
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		const p1 = client.request("/movie/9999");
		const p2 = client.request("/movie/9999");

		rejectJson(new Error("forced json parse fail"));

		await expect(p1).rejects.toThrow();
		await expect(p2).rejects.toThrow();

		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});

	it("allows a new request after a failed deduplicated request completes", async () => {
		const client = new ApiClient(token);

		const failResponse: MockResponse = {
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: async () => ({ status_message: "Server Error", status_code: 11 }),
		};

		const successResponse: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: async () => ({ id: 550 }),
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(failResponse).mockResolvedValueOnce(successResponse);

		await expect(client.request("/movie/550")).rejects.toThrow();
		const result = await client.request("/movie/550");
		expect(result).toEqual({ id: 550 });
		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
	});
});

describe("ApiClient deduplication disabled", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("makes one fetch per call even when requests are concurrent", async () => {
		const client = new ApiClient(token, { deduplication: false });

		const makeResponse = (): MockResponse => ({
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: async () => ({ id: 550 }),
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse())
			.mockResolvedValueOnce(makeResponse())
			.mockResolvedValueOnce(makeResponse());

		const [r1, r2, r3] = await Promise.all([
			client.request("/movie/550", { language: "en-US" }),
			client.request("/movie/550", { language: "en-US" }),
			client.request("/movie/550", { language: "en-US" }),
		]);

		expect(globalThis.fetch).toHaveBeenCalledTimes(3);
		expect(r1).toEqual({ id: 550 });
		expect(r2).toEqual({ id: 550 });
		expect(r3).toEqual({ id: 550 });
	});

	it("is enabled by default when option is omitted", async () => {
		const client = new ApiClient(token);

		let resolveJson!: (value: unknown) => void;
		const jsonPromise = new Promise((resolve) => {
			resolveJson = resolve;
		});

		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: makeHeaders({}),
			json: () => jsonPromise,
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		const [r1, r2] = await Promise.all([
			client.request("/movie/550"),
			client.request("/movie/550"),
			(async () => {
				resolveJson({ id: 550 });
			})(),
		]).then(([a, b]) => [a, b]);

		// Default is on — only one fetch
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		expect(r1).toEqual({ id: 550 });
		expect(r2).toEqual({ id: 550 });
	});
});
