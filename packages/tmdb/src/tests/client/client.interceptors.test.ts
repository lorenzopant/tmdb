import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import type { RequestInterceptorContext } from "../../types/config/options";

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

const makeResponse = (body: unknown = { id: 1 }): MockResponse => ({
	ok: true,
	status: 200,
	statusText: "OK",
	url: "https://api.themoviedb.org/3/movie/1",
	headers: makeHeaders({}),
	json: async () => body,
});

// Hardcoded mock JWT — fetch is fully mocked, so a real token is not needed
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwfQ.signature";

describe("ApiClient request interceptors", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn().mockResolvedValue(makeResponse());
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("calls a single interceptor before the fetch", async () => {
		const interceptor = vi.fn();
		const client = new ApiClient(token, { interceptors: { request: interceptor } });

		await client.request("/movie/1", { language: "en-US" });

		expect(interceptor).toHaveBeenCalledOnce();
		expect(interceptor).toHaveBeenCalledWith<[RequestInterceptorContext]>({
			endpoint: "/movie/1",
			params: { language: "en-US" },
			method: "GET",
		});
	});

	it("calls multiple interceptors in order", async () => {
		const order: number[] = [];
		const client = new ApiClient(token, {
			interceptors: {
				request: [
					() => {
						order.push(1);
					},
					() => {
						order.push(2);
					},
					() => {
						order.push(3);
					},
				],
			},
		});

		await client.request("/movie/1");

		expect(order).toEqual([1, 2, 3]);
	});

	it("allows an interceptor to modify params", async () => {
		const client = new ApiClient(token, {
			interceptors: {
				request: (ctx) => ({ ...ctx, params: { ...ctx.params, language: "fr-FR" } }),
			},
		});

		await client.request("/movie/1", { language: "en-US" });

		const calledUrl = new URL((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string);
		expect(calledUrl.searchParams.get("language")).toBe("fr-FR");
	});

	it("allows an interceptor to modify the endpoint", async () => {
		const client = new ApiClient(token, {
			interceptors: {
				request: (ctx) => ({ ...ctx, endpoint: "/movie/999" }),
			},
		});

		await client.request("/movie/1");

		const calledUrl = new URL((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string);
		expect(calledUrl.pathname).toBe("/3/movie/999");
	});

	it("threads modified context through multiple interceptors", async () => {
		const client = new ApiClient(token, {
			interceptors: {
				request: [
					(ctx) => ({ ...ctx, params: { ...ctx.params, include_adult: false } }),
					(ctx) => ({ ...ctx, params: { ...ctx.params, language: "de-DE" } }),
				],
			},
		});

		await client.request("/movie/1", {});

		const calledUrl = new URL((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string);
		expect(calledUrl.searchParams.get("include_adult")).toBe("false");
		expect(calledUrl.searchParams.get("language")).toBe("de-DE");
	});

	it("handles async interceptors", async () => {
		const interceptor = vi.fn().mockResolvedValue(undefined);
		const client = new ApiClient(token, { interceptors: { request: interceptor } });

		await client.request("/movie/1");

		expect(interceptor).toHaveBeenCalledOnce();
	});

	it("interceptor returning void leaves the request unchanged", async () => {
		const client = new ApiClient(token, {
			interceptors: {
				request: (_ctx) => {
					// observe only, return nothing
				},
			},
		});

		await client.request("/movie/1", { language: "en-US" });

		const calledUrl = new URL((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string);
		expect(calledUrl.pathname).toBe("/3/movie/1");
		expect(calledUrl.searchParams.get("language")).toBe("en-US");
	});

	it("works when no interceptors are configured", async () => {
		const client = new ApiClient(token);

		await client.request("/movie/1", { language: "en-US" });

		expect(globalThis.fetch).toHaveBeenCalledOnce();
	});

	// -------------------------------------------------------------------------
	// Interceptors × deduplication
	// -------------------------------------------------------------------------

	it("deduplication key is based on post-interceptor endpoint so rewritten endpoints are deduplicated correctly", async () => {
		// Interceptor rewrites /movie/1 → /movie/999.
		// Two concurrent calls with the same original endpoint + same rewritten target
		// should share one in-flight fetch.
		let resolveJson!: (v: unknown) => void;
		const jsonPromise = new Promise((resolve) => {
			resolveJson = resolve;
		});
		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/999",
			headers: makeHeaders({}),
			json: () => jsonPromise,
		};
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		const client = new ApiClient(token, {
			interceptors: { request: (ctx) => ({ ...ctx, endpoint: "/movie/999" }) },
		});

		const [r1, r2] = await Promise.all([
			client.request("/movie/1"),
			client.request("/movie/1"),
			(async () => {
				resolveJson({ id: 999 });
			})(),
		]).then(([a, b]) => [a, b]);

		// Both callers resolved; only one fetch fired because the rewritten endpoint
		// is the same and dedup works on the effective key.
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		expect(r1).toEqual({ id: 999 });
		expect(r2).toEqual({ id: 999 });
	});

	it("deduplication does not collapse requests that interceptors route to different endpoints", async () => {
		let counter = 0;
		// Interceptor routes each call to a unique endpoint based on a closure counter.
		const client = new ApiClient(token, {
			interceptors: { request: (ctx) => ({ ...ctx, endpoint: `/movie/${++counter}` }) },
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse({ id: 1 }))
			.mockResolvedValueOnce(makeResponse({ id: 2 }));

		const [r1, r2] = await Promise.all([client.request("/movie/X"), client.request("/movie/X")]);

		// Interceptor produced two different effective endpoints → two fetches.
		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
		expect(r1).toEqual({ id: 1 });
		expect(r2).toEqual({ id: 2 });
	});

	// -------------------------------------------------------------------------
	// Interceptors × cache
	// -------------------------------------------------------------------------

	it("cache is keyed on post-interceptor endpoint so rewritten requests hit the cache correctly", async () => {
		// Interceptor appends include_adult=false to every request.
		// The cache key must include that param — a plain /movie/1 lookup must not
		// hit the same entry as /movie/1?include_adult=false.
		const client = new ApiClient(token, {
			cache: { ttl: 60_000 },
			deduplication: false,
			interceptors: {
				request: (ctx) => ({ ...ctx, params: { ...ctx.params, include_adult: false } }),
			},
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeResponse({ id: 550 }));

		await client.request("/movie/550");
		// Second call should be served from cache (same effective endpoint+params).
		await client.request("/movie/550");

		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});

	it("interceptors run exactly once per request() call even when cache is enabled", async () => {
		const interceptor = vi.fn((ctx: RequestInterceptorContext) => ctx);
		const client = new ApiClient(token, {
			cache: { ttl: 60_000 },
			deduplication: false,
			interceptors: { request: interceptor },
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse({ id: 1 }));

		// First call — interceptor runs once, fetch fires.
		await client.request("/movie/1");
		// Second call — served from cache, but interceptor should still run to derive the key.
		await client.request("/movie/1");

		// fetch fired once (second was cached), interceptor ran twice (once per call).
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		expect(interceptor).toHaveBeenCalledTimes(2);
	});
});
