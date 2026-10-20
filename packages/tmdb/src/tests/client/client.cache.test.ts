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

const makeResponse = (data: unknown): MockResponse => ({
	ok: true,
	status: 200,
	statusText: "OK",
	url: "https://api.themoviedb.org/3/movie/550",
	headers: { get: () => null },
	json: async () => data,
});

// Hardcoded mock JWT — fetch is fully mocked, so a real token is not needed
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwfQ.signature";

describe("ApiClient response caching", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.useFakeTimers();
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		vi.useRealTimers();
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("does not cache when the cache option is not set", async () => {
		const client = new ApiClient(token, { deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse({ id: 550 }))
			.mockResolvedValueOnce(makeResponse({ id: 550 }));

		await client.request("/movie/550");
		await client.request("/movie/550");

		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
	});

	it("serves the second identical request from cache (no network)", async () => {
		const client = new ApiClient(token, { cache: true, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse({ id: 550 }));

		const r1 = await client.request("/movie/550");
		const r2 = await client.request("/movie/550");

		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		expect(r1).toEqual({ id: 550 });
		expect(r2).toEqual({ id: 550 });
	});

	it("makes separate fetches for different endpoints even with caching on", async () => {
		const client = new ApiClient(token, { cache: true, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse({ id: 550 }))
			.mockResolvedValueOnce(makeResponse({ id: 551 }));

		const r1 = await client.request("/movie/550");
		const r2 = await client.request("/movie/551");

		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
		expect(r1).toEqual({ id: 550 });
		expect(r2).toEqual({ id: 551 });
	});

	it("makes separate fetches for the same endpoint with different params", async () => {
		const client = new ApiClient(token, { cache: true, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse({ title: "en title" }))
			.mockResolvedValueOnce(makeResponse({ title: "fr titre" }));

		const r1 = await client.request("/movie/550", { language: "en-US" });
		const r2 = await client.request("/movie/550", { language: "fr-FR" });

		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
		expect(r1).toEqual({ title: "en title" });
		expect(r2).toEqual({ title: "fr titre" });
	});

	it("re-fetches after the TTL expires", async () => {
		const client = new ApiClient(token, { cache: { ttl: 1_000 }, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse({ id: 550, v: 1 }))
			.mockResolvedValueOnce(makeResponse({ id: 550, v: 2 }));

		const r1 = await client.request("/movie/550");
		// Advance past the TTL
		vi.advanceTimersByTime(1_001);
		const r2 = await client.request("/movie/550");

		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
		expect(r1).toEqual({ id: 550, v: 1 });
		expect(r2).toEqual({ id: 550, v: 2 });
	});

	it("serves from cache before the TTL expires", async () => {
		const client = new ApiClient(token, { cache: { ttl: 1_000 }, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse({ id: 550 }));

		await client.request("/movie/550");
		// Advance to just before expiry
		vi.advanceTimersByTime(999);
		await client.request("/movie/550");

		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});

	it("evicts the oldest entry when max_size is reached", async () => {
		const client = new ApiClient(token, { cache: { ttl: 60_000, max_size: 2 }, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse({ id: 1 }))
			.mockResolvedValueOnce(makeResponse({ id: 2 }))
			.mockResolvedValueOnce(makeResponse({ id: 3 }))
			// Entry 1 was evicted, so /movie/1 needs a fresh fetch
			.mockResolvedValueOnce(makeResponse({ id: 1 }));

		await client.request("/movie/1");
		await client.request("/movie/2");
		await client.request("/movie/3"); // evicts /movie/1

		// /movie/2 and /movie/3 should still be cached
		await client.request("/movie/2");
		await client.request("/movie/3");
		// /movie/1 was evicted — must re-fetch
		await client.request("/movie/1");

		expect(globalThis.fetch).toHaveBeenCalledTimes(4);
	});

	it("works with cache enabled alongside deduplication", async () => {
		const client = new ApiClient(token, { cache: true });

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse({ id: 550 }));

		// First call populates cache
		await client.request("/movie/550");
		// Second call should hit cache immediately, no in-flight involved
		const r = await client.request("/movie/550");

		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		expect(r).toEqual({ id: 550 });
	});

	it("enables cache with cache: true using default TTL", async () => {
		const client = new ApiClient(token, { cache: true, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse({ id: 1 }));

		await client.request("/movie/1");
		// Advance 4 minutes — still within 5-minute default TTL
		vi.advanceTimersByTime(4 * 60 * 1_000);
		await client.request("/movie/1");

		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});

	it("serves a cached undefined value as a hit (does not re-fetch)", async () => {
		// sanitizeNulls() converts top-level null → undefined, so an endpoint that
		// returns null would be stored as undefined. The client must use has() not a
		// value-against-undefined check so these are treated as cache hits.
		const client = new ApiClient(token, { cache: { ttl: 60_000 }, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse(null));

		const r1 = await client.request("/movie/550");
		const r2 = await client.request("/movie/550");

		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		// null is sanitised to undefined by sanitizeNulls()
		expect(r1).toBeUndefined();
		expect(r2).toBeUndefined();
	});

	// -------------------------------------------------------------------------
	// excluded_endpoints
	// -------------------------------------------------------------------------

	it("never caches requests matching an excluded string prefix", async () => {
		const client = new ApiClient(token, {
			cache: { ttl: 60_000, excluded_endpoints: ["/trending"] },
			deduplication: false,
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse({ results: [1] }))
			.mockResolvedValueOnce(makeResponse({ results: [2] }));

		await client.request("/trending/movie/day");
		await client.request("/trending/movie/day");

		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
	});

	it("still caches non-excluded endpoints when exclusions are configured", async () => {
		const client = new ApiClient(token, {
			cache: { ttl: 60_000, excluded_endpoints: ["/trending"] },
			deduplication: false,
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse({ id: 550 }));

		await client.request("/movie/550");
		await client.request("/movie/550");

		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});

	it("never caches requests matching an excluded RegExp", async () => {
		const client = new ApiClient(token, {
			cache: { ttl: 60_000, excluded_endpoints: [/\/discover\//] },
			deduplication: false,
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse({ results: [] }))
			.mockResolvedValueOnce(makeResponse({ results: [] }));

		await client.request("/discover/movie", { sort_by: "popularity.desc" });
		await client.request("/discover/movie", { sort_by: "popularity.desc" });

		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
	});

	// -------------------------------------------------------------------------
	// invalidateCache / clearCache / cacheSize
	// -------------------------------------------------------------------------

	it("invalidateCache removes the entry so the next request fetches fresh data", async () => {
		const client = new ApiClient(token, { cache: { ttl: 60_000 }, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse({ id: 550, v: 1 }))
			.mockResolvedValueOnce(makeResponse({ id: 550, v: 2 }));

		await client.request("/movie/550", { language: "en-US" });
		client.invalidateCache("/movie/550", { language: "en-US" });
		const r = await client.request("/movie/550", { language: "en-US" });

		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
		expect(r).toEqual({ id: 550, v: 2 });
	});

	it("invalidateCache returns false when the entry is not in the cache", async () => {
		const client = new ApiClient(token, { cache: { ttl: 60_000 }, deduplication: false });
		expect(client.invalidateCache("/movie/999")).toBe(false);
	});

	it("invalidateCache returns false when cache is not enabled", async () => {
		const client = new ApiClient(token, { deduplication: false });
		expect(client.invalidateCache("/movie/550")).toBe(false);
	});

	it("clearCache removes all entries so subsequent requests re-fetch", async () => {
		const client = new ApiClient(token, { cache: { ttl: 60_000 }, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse({ id: 1 }))
			.mockResolvedValueOnce(makeResponse({ id: 2 }))
			.mockResolvedValueOnce(makeResponse({ id: 1, fresh: true }))
			.mockResolvedValueOnce(makeResponse({ id: 2, fresh: true }));

		await client.request("/movie/1");
		await client.request("/movie/2");
		expect(client.cacheSize).toBe(2);

		client.clearCache();
		expect(client.cacheSize).toBe(0);

		const r1 = await client.request("/movie/1");
		const r2 = await client.request("/movie/2");

		expect(globalThis.fetch).toHaveBeenCalledTimes(4);
		expect(r1).toEqual({ id: 1, fresh: true });
		expect(r2).toEqual({ id: 2, fresh: true });
	});

	it("cacheSize returns 0 when cache is not enabled", () => {
		const client = new ApiClient(token);
		expect(client.cacheSize).toBe(0);
	});

	// -------------------------------------------------------------------------
	// ttl as a function
	// -------------------------------------------------------------------------

	describe("ttl function", () => {
		const fetchMock = () => globalThis.fetch as ReturnType<typeof vi.fn>;

		it("keeps a number ttl applying the same lifetime to every entry", async () => {
			const client = new ApiClient(token, { cache: { ttl: 1_000 }, deduplication: false });

			fetchMock().mockImplementation(async () => makeResponse({ ok: true }));

			await client.request("/movie/1");
			await client.request("/search/movie", { query: "fight" });
			vi.advanceTimersByTime(999);
			await client.request("/movie/1");
			await client.request("/search/movie", { query: "fight" });
			expect(globalThis.fetch).toHaveBeenCalledTimes(2);

			vi.advanceTimersByTime(2);
			await client.request("/movie/1");
			await client.request("/search/movie", { query: "fight" });
			expect(globalThis.fetch).toHaveBeenCalledTimes(4);
		});

		it("gives each entry the lifetime returned for it", async () => {
			const ttl = vi.fn(({ endpoint }: { endpoint: string }) => (endpoint === "/movie/550" ? 10_000 : 1_000));
			const client = new ApiClient(token, { cache: { ttl }, deduplication: false });

			fetchMock().mockImplementation(async () => makeResponse({ ok: true }));

			await client.request("/movie/550");
			await client.request("/trending/movie/day");

			vi.advanceTimersByTime(1_001);
			await client.request("/movie/550"); // still cached
			await client.request("/trending/movie/day"); // expired
			expect(globalThis.fetch).toHaveBeenCalledTimes(3);

			vi.advanceTimersByTime(9_000);
			await client.request("/movie/550"); // now expired
			expect(globalThis.fetch).toHaveBeenCalledTimes(4);
		});

		it("calls the function once per insert with key, endpoint, params and data — never on reads", async () => {
			const ttl = vi.fn(() => 60_000);
			// Default deduplication path
			const client = new ApiClient(token, { cache: { ttl } });

			fetchMock().mockResolvedValueOnce(makeResponse({ id: 550, tagline: null }));

			await client.request("/movie/550", { language: "en-US", page: undefined });
			await client.request("/movie/550", { language: "en-US" });
			await client.request("/movie/550", { language: "en-US" });

			expect(ttl).toHaveBeenCalledTimes(1);
			expect(ttl).toHaveBeenCalledWith({
				key: "/movie/550?language=en-US",
				endpoint: "/movie/550",
				params: { language: "en-US", page: undefined },
				data: { id: 550, tagline: undefined },
			});
		});

		it("does not cache a response when the function returns 0 or a negative number", async () => {
			const client = new ApiClient(token, {
				cache: { ttl: ({ endpoint }) => (endpoint === "/movie/1" ? 0 : -5) },
				deduplication: false,
			});

			fetchMock().mockImplementation(async () => makeResponse({ ok: true }));

			expect(await client.request("/movie/1")).toEqual({ ok: true });
			await client.request("/movie/1");
			await client.request("/movie/2");
			await client.request("/movie/2");

			expect(globalThis.fetch).toHaveBeenCalledTimes(4);
			expect(client.cacheSize).toBe(0);
		});

		it("returns the response, caches nothing and logs when the function throws", async () => {
			const logger = vi.fn();
			const client = new ApiClient(token, {
				logger,
				cache: {
					ttl: () => {
						throw new Error("boom");
					},
				},
			});

			fetchMock()
				.mockResolvedValueOnce(makeResponse({ id: 550 }))
				.mockResolvedValueOnce(makeResponse({ id: 550 }));

			await expect(client.request("/movie/550")).resolves.toEqual({ id: 550 });
			await expect(client.request("/movie/550")).resolves.toEqual({ id: 550 });

			expect(globalThis.fetch).toHaveBeenCalledTimes(2);
			expect(client.cacheSize).toBe(0);
			expect(logger).toHaveBeenCalledWith({
				type: "error",
				method: "GET",
				endpoint: "/movie/550",
				errorMessage: "cache.ttl function threw: Error: boom",
			});
		});

		it("does not cache and logs when the function returns a non-finite number", async () => {
			const logger = vi.fn();
			const client = new ApiClient(token, {
				logger,
				cache: { ttl: (() => undefined) as unknown as () => number },
				deduplication: false,
			});

			fetchMock().mockImplementation(async () => makeResponse({ ok: true }));

			await expect(client.request("/movie/550")).resolves.toEqual({ ok: true });
			expect(client.cacheSize).toBe(0);
			expect(logger).toHaveBeenCalledWith(
				expect.objectContaining({ type: "error", errorMessage: "cache.ttl function must return a finite number (got undefined)" }),
			);
		});

		it("never calls the function for excluded endpoints", async () => {
			const ttl = vi.fn(() => 60_000);
			const client = new ApiClient(token, {
				cache: { ttl, excluded_endpoints: ["/trending"] },
				deduplication: false,
			});

			fetchMock().mockImplementation(async () => makeResponse({ results: [] }));

			await client.request("/trending/movie/day");
			await client.request("/trending/movie/day");

			expect(ttl).not.toHaveBeenCalled();
			expect(globalThis.fetch).toHaveBeenCalledTimes(2);
		});

		it("evicts by insertion order under max_size regardless of each entry's ttl", async () => {
			const lifetimes: Record<string, number> = { "/movie/1": 100_000, "/movie/2": 1_000, "/movie/3": 0, "/movie/4": 50_000 };
			const client = new ApiClient(token, {
				cache: { ttl: ({ endpoint }) => lifetimes[endpoint], max_size: 2 },
				deduplication: false,
			});

			fetchMock().mockImplementation(async () => makeResponse({ ok: true }));

			await client.request("/movie/1");
			await client.request("/movie/2");
			await client.request("/movie/3"); // ttl 0 — not inserted, so nothing is evicted
			expect(client.cacheSize).toBe(2);

			await client.request("/movie/4"); // evicts /movie/1 (oldest), despite its long ttl
			expect(client.cacheSize).toBe(2);
			expect(globalThis.fetch).toHaveBeenCalledTimes(4);

			await client.request("/movie/2"); // cached
			await client.request("/movie/4"); // cached
			expect(globalThis.fetch).toHaveBeenCalledTimes(4);

			await client.request("/movie/1"); // was evicted — re-fetch, evicts /movie/2
			expect(globalThis.fetch).toHaveBeenCalledTimes(5);

			vi.advanceTimersByTime(50_001);
			await client.request("/movie/4"); // expired by its own ttl
			await client.request("/movie/1"); // still within 100s
			expect(globalThis.fetch).toHaveBeenCalledTimes(6);
		});
	});
});
