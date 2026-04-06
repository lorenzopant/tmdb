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

describe("ApiClient rate limiting", () => {
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

	it("does not rate limit requests when rate_limit option is not set", async () => {
		const client = new ApiClient(token);

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeResponse({ id: 1 }))
			.mockResolvedValueOnce(makeResponse({ id: 2 }))
			.mockResolvedValueOnce(makeResponse({ id: 3 }));

		await client.request("/movie/1");
		await client.request("/movie/2");
		await client.request("/movie/3");

		expect(globalThis.fetch).toHaveBeenCalledTimes(3);
	});

	it("dispatches requests immediately when under the limit", async () => {
		const client = new ApiClient(token, {
			rate_limit: { max_requests: 5, per_ms: 1_000 },
			deduplication: false,
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeResponse({ id: 1 }));

		// Fire 5 requests — all should go through without waiting
		const promises = Array.from({ length: 5 }, (_, i) => client.request(`/movie/${i}`));
		await Promise.all(promises);

		expect(globalThis.fetch).toHaveBeenCalledTimes(5);
	});

	it("queues the 6th request when max_requests=5 are in the window", async () => {
		const client = new ApiClient(token, {
			rate_limit: { max_requests: 5, per_ms: 1_000 },
			deduplication: false,
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeResponse({ id: 1 }));

		// Fire 5 requests without advancing time
		const firstBatch = Array.from({ length: 5 }, (_, i) => client.request(`/movie/${i}`));
		await Promise.all(firstBatch);

		expect(globalThis.fetch).toHaveBeenCalledTimes(5);

		// 6th request should be queued — not yet dispatched
		let sixthSettled = false;
		const sixthPromise = client.request("/movie/6").then((r) => {
			sixthSettled = true;
			return r;
		});

		// Flush microtasks — the 6th request is queued but waiting for the window to slide
		await Promise.resolve();
		expect(sixthSettled).toBe(false);

		// Advance time past the window so the oldest slot expires
		vi.advanceTimersByTime(1_001);
		await sixthPromise;

		expect(sixthSettled).toBe(true);
		expect(globalThis.fetch).toHaveBeenCalledTimes(6);
	});

	it("accepts rate_limit: true and uses default limits", async () => {
		// Default is ~40 req / s. Test that true is accepted and doesn't throw.
		const client = new ApiClient(token, { rate_limit: true, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeResponse({ id: 1 }));

		await client.request("/movie/1");
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});

	it("rate limiter applies to mutate() calls as well", async () => {
		const client = new ApiClient(token, {
			rate_limit: { max_requests: 2, per_ms: 1_000 },
			deduplication: false,
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeResponse({ success: true }));

		await client.mutate("POST", "/account/1/favorite", { media_type: "movie", media_id: 1, favorite: true });
		await client.mutate("POST", "/account/1/favorite", { media_type: "movie", media_id: 2, favorite: true });

		expect(globalThis.fetch).toHaveBeenCalledTimes(2);

		// 3rd call should be queued
		let thirdSettled = false;
		const thirdPromise = client
			.mutate("POST", "/account/1/favorite", { media_type: "movie", media_id: 3, favorite: true })
			.then((r) => {
				thirdSettled = true;
				return r;
			});

		await Promise.resolve();
		expect(thirdSettled).toBe(false);

		vi.advanceTimersByTime(1_001);
		await thirdPromise;
		expect(thirdSettled).toBe(true);
		expect(globalThis.fetch).toHaveBeenCalledTimes(3);
	});
});
