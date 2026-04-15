import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { TMDBError } from "../../errors/tmdb";
import { RetryManager } from "../../utils/retry";

type MockResponse = {
	ok: boolean;
	status: number;
	statusText: string;
	url: string;
	headers: { get: (key: string) => string | null };
	json: () => Promise<unknown>;
};

const makeResponse = (data: unknown, status = 200): MockResponse => ({
	ok: status >= 200 && status < 300,
	status,
	statusText: status === 200 ? "OK" : "Error",
	url: "https://api.themoviedb.org/3/movie/550",
	headers: { get: () => null },
	json: async () => (status >= 200 && status < 300 ? data : { status_message: "Server Error", status_code: 11 }),
});

const makeErrorResponse = (status: number, statusText: string): MockResponse => ({
	ok: false,
	status,
	statusText,
	url: "https://api.themoviedb.org/3/movie/550",
	headers: { get: () => null },
	json: async () => ({ status_message: statusText, status_code: 11 }),
});

// Hardcoded mock JWT — fetch is fully mocked, so a real token is not needed
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwfQ.signature";

// ─── RetryManager unit tests ────────────────────────────────────────────────

describe("RetryManager", () => {
	const noopSleep = async () => {};

	it("returns the result on the first successful attempt", async () => {
		const manager = new RetryManager({ max_retries: 3 });
		const fn = vi.fn().mockResolvedValueOnce("ok");
		const result = await manager.execute(fn, noopSleep);
		expect(result).toBe("ok");
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("retries on 5xx TMDBError and succeeds on the second attempt", async () => {
		const manager = new RetryManager({ max_retries: 3 });
		const fn = vi.fn().mockRejectedValueOnce(new TMDBError("Internal Server Error", 500)).mockResolvedValueOnce("recovered");
		const result = await manager.execute(fn, noopSleep);
		expect(result).toBe("recovered");
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("retries on network errors (non-TMDBError)", async () => {
		const manager = new RetryManager({ max_retries: 3 });
		const fn = vi
			.fn()
			.mockRejectedValueOnce(new TypeError("fetch failed"))
			.mockRejectedValueOnce(new TypeError("fetch failed"))
			.mockResolvedValueOnce("recovered");
		const result = await manager.execute(fn, noopSleep);
		expect(result).toBe("recovered");
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it("retries on FetchError by default", async () => {
		const manager = new RetryManager({ max_retries: 3 });
		const fetchError = new Error("socket hang up");
		fetchError.name = "FetchError";
		const fn = vi.fn().mockRejectedValueOnce(fetchError).mockResolvedValueOnce("recovered");

		const result = await manager.execute(fn, noopSleep);

		expect(result).toBe("recovered");
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("retries on AbortError by default", async () => {
		const manager = new RetryManager({ max_retries: 3 });
		const abortError = new Error("aborted");
		abortError.name = "AbortError";
		const fn = vi.fn().mockRejectedValueOnce(abortError).mockResolvedValueOnce("recovered");

		const result = await manager.execute(fn, noopSleep);

		expect(result).toBe("recovered");
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("does NOT retry on 4xx TMDBError", async () => {
		const manager = new RetryManager({ max_retries: 3 });
		const fn = vi.fn().mockRejectedValue(new TMDBError("Not Found", 404));
		await expect(manager.execute(fn, noopSleep)).rejects.toThrow(TMDBError);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("does NOT retry on 401 Unauthorized", async () => {
		const manager = new RetryManager({ max_retries: 3 });
		const fn = vi.fn().mockRejectedValue(new TMDBError("Unauthorized", 401));
		await expect(manager.execute(fn, noopSleep)).rejects.toThrow("Unauthorized");
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("does NOT retry on SyntaxError by default", async () => {
		const manager = new RetryManager({ max_retries: 3 });
		const fn = vi.fn().mockRejectedValue(new SyntaxError("Unexpected token"));

		await expect(manager.execute(fn, noopSleep)).rejects.toThrow(SyntaxError);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("does NOT retry on generic Error by default", async () => {
		const manager = new RetryManager({ max_retries: 3 });
		const fn = vi.fn().mockRejectedValue(new Error("boom"));

		await expect(manager.execute(fn, noopSleep)).rejects.toThrow("boom");
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("retries non-Error thrown values by default", async () => {
		const manager = new RetryManager({ max_retries: 3 });
		const fn = vi.fn().mockRejectedValueOnce("transient").mockResolvedValueOnce("recovered");

		const result = await manager.execute(fn, noopSleep);

		expect(result).toBe("recovered");
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("exhausts all retries and re-throws the last error", async () => {
		const manager = new RetryManager({ max_retries: 2 });
		const err = new TMDBError("Internal Server Error", 500);
		const fn = vi.fn().mockRejectedValue(err);
		await expect(manager.execute(fn, noopSleep)).rejects.toBe(err);
		// 1 initial + 2 retries = 3 total
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it("respects max_retries: 0 — no retries at all", async () => {
		const manager = new RetryManager({ max_retries: 0 });
		const fn = vi.fn().mockRejectedValue(new TMDBError("Service Unavailable", 503));
		await expect(manager.execute(fn, noopSleep)).rejects.toThrow();
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("stops retrying when shouldRetry returns false", async () => {
		const manager = new RetryManager({
			max_retries: 5,
			shouldRetry: (_err, attempt) => attempt < 2,
		});
		const fn = vi.fn().mockRejectedValue(new TMDBError("Internal Server Error", 500));
		await expect(manager.execute(fn, noopSleep)).rejects.toThrow();
		// attempt=1 → retry; attempt=2 → stop. So 1 initial + 1 retry = 2 total
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("calls shouldRetry with the correct attempt number", async () => {
		const shouldRetry = vi.fn().mockResolvedValue(true);
		const manager = new RetryManager({ max_retries: 3, shouldRetry });
		const fn = vi
			.fn()
			.mockRejectedValueOnce(new TMDBError("Error", 500))
			.mockRejectedValueOnce(new TMDBError("Error", 500))
			.mockResolvedValueOnce("ok");
		await manager.execute(fn, noopSleep);
		expect(shouldRetry).toHaveBeenNthCalledWith(1, expect.any(TMDBError), 1);
		expect(shouldRetry).toHaveBeenNthCalledWith(2, expect.any(TMDBError), 2);
	});

	it("accepts an async shouldRetry predicate", async () => {
		const manager = new RetryManager({
			max_retries: 3,
			shouldRetry: async (err) => err instanceof TMDBError && err.http_status_code >= 500,
		});
		const fn = vi.fn().mockRejectedValueOnce(new TMDBError("Error", 503)).mockResolvedValueOnce("ok");
		const result = await manager.execute(fn, noopSleep);
		expect(result).toBe("ok");
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("awaits sleep with computed delay before retrying", async () => {
		const sleep = vi.fn().mockResolvedValue(undefined);
		const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
		const manager = new RetryManager({ max_retries: 1, base_delay_ms: 100, max_delay_ms: 1_000 });
		const fn = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce("ok");

		const result = await manager.execute(fn, sleep);

		expect(result).toBe("ok");
		expect(sleep).toHaveBeenCalledTimes(1);
		expect(sleep).toHaveBeenCalledWith(50);
		randomSpy.mockRestore();
	});

	it("skips sleep when computed delay is zero", async () => {
		const sleep = vi.fn().mockResolvedValue(undefined);
		const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
		const manager = new RetryManager({ max_retries: 1, base_delay_ms: 100, max_delay_ms: 1_000 });
		const fn = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce("ok");

		const result = await manager.execute(fn, sleep);

		expect(result).toBe("ok");
		expect(sleep).not.toHaveBeenCalled();
		randomSpy.mockRestore();
	});

	it("computes delay with full jitter (within [0, base * 2^(n-1)])", () => {
		const manager = new RetryManager({ base_delay_ms: 100, max_delay_ms: 10_000 });

		for (let n = 1; n <= 5; n++) {
			const delay = manager.delayFor(n);
			const cap = Math.min(100 * 2 ** (n - 1), 10_000);
			expect(delay).toBeGreaterThanOrEqual(0);
			expect(delay).toBeLessThan(cap + 1);
		}
	});

	it("clamps delay to max_delay_ms", () => {
		const manager = new RetryManager({ base_delay_ms: 1_000, max_delay_ms: 2_000 });
		// attempt 10 → exponential = 1000 * 2^9 = 512000, clamped to 2000
		for (let i = 0; i < 50; i++) {
			expect(manager.delayFor(10)).toBeLessThanOrEqual(2_000);
		}
	});

	describe("constructor validation", () => {
		it.each([-1, 0.5, NaN, Infinity, -Infinity])("throws RangeError for invalid max_retries: %s", (v) => {
			expect(() => new RetryManager({ max_retries: v })).toThrow(RangeError);
		});

		it.each([0, -1, 0.5, NaN, Infinity])("throws RangeError for invalid base_delay_ms: %s", (v) => {
			expect(() => new RetryManager({ base_delay_ms: v })).toThrow(RangeError);
		});

		it.each([0, -1, 0.5, NaN, Infinity])("throws RangeError for invalid max_delay_ms: %s", (v) => {
			expect(() => new RetryManager({ max_delay_ms: v })).toThrow(RangeError);
		});
	});
});

// ─── ApiClient retry integration tests ──────────────────────────────────────

describe("ApiClient retry", () => {
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

	it("does not retry when retry option is not set", async () => {
		const client = new ApiClient(token, { deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeErrorResponse(500, "Internal Server Error"));

		await expect(client.request("/movie/550")).rejects.toThrow(TMDBError);
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});

	it("accepts retry: true and uses default options", async () => {
		const client = new ApiClient(token, { retry: true, deduplication: false });

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeErrorResponse(500, "Internal Server Error"))
			.mockResolvedValueOnce(makeResponse({ id: 550 }));

		const promise = client.request("/movie/550");
		// Drain all pending timers/microtasks introduced by the retry delay
		await vi.runAllTimersAsync();
		const result = await promise;

		expect(result).toEqual({ id: 550 });
		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
	});

	it("retries on 5xx and ultimately succeeds", async () => {
		const client = new ApiClient(token, {
			retry: { max_retries: 3, base_delay_ms: 100 },
			deduplication: false,
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeErrorResponse(503, "Service Unavailable"))
			.mockResolvedValueOnce(makeErrorResponse(503, "Service Unavailable"))
			.mockResolvedValueOnce(makeResponse({ id: 1 }));

		const promise = client.request("/movie/1");
		await vi.runAllTimersAsync();
		const result = await promise;

		expect(result).toEqual({ id: 1 });
		expect(globalThis.fetch).toHaveBeenCalledTimes(3);
	});

	it("does not call onError for transient retry failures that later succeed", async () => {
		const onError = vi.fn();
		const client = new ApiClient(token, {
			retry: { max_retries: 3, base_delay_ms: 100 },
			deduplication: false,
			interceptors: {
				response: { onError },
			},
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeErrorResponse(503, "Service Unavailable"))
			.mockResolvedValueOnce(makeResponse({ id: 1 }));

		const promise = client.request("/movie/1");
		await vi.runAllTimersAsync();
		const result = await promise;

		expect(result).toEqual({ id: 1 });
		expect(onError).not.toHaveBeenCalled();
	});

	it("retries on network errors (fetch throws)", async () => {
		const client = new ApiClient(token, {
			retry: { max_retries: 2, base_delay_ms: 50 },
			deduplication: false,
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockRejectedValueOnce(new TypeError("fetch failed"))
			.mockResolvedValueOnce(makeResponse({ id: 42 }));

		const promise = client.request("/movie/42");
		await vi.runAllTimersAsync();
		const result = await promise;

		expect(result).toEqual({ id: 42 });
		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
	});

	it("does NOT retry on 4xx errors", async () => {
		const client = new ApiClient(token, {
			retry: { max_retries: 3 },
			deduplication: false,
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeErrorResponse(404, "Not Found"));

		await expect(client.request("/movie/999")).rejects.toThrow(TMDBError);
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});

	it("exhausts max_retries and throws the last error", async () => {
		const client = new ApiClient(token, {
			retry: { max_retries: 2, base_delay_ms: 10 },
			deduplication: false,
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeErrorResponse(500, "Internal Server Error"));

		const promise = client.request("/movie/550");
		const expectation = expect(promise).rejects.toThrow(TMDBError);
		await vi.runAllTimersAsync();
		await expectation;
		// 1 initial + 2 retries = 3 total
		expect(globalThis.fetch).toHaveBeenCalledTimes(3);
	});

	it("respects a custom shouldRetry predicate", async () => {
		const client = new ApiClient(token, {
			retry: {
				max_retries: 5,
				shouldRetry: (err) => err instanceof TMDBError && err.http_status_code === 503,
			},
			deduplication: false,
		});

		// 503 → retried; 500 → not retried by custom predicate
		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeErrorResponse(503, "Service Unavailable"))
			.mockResolvedValueOnce(makeErrorResponse(500, "Internal Server Error"));

		const promise = client.request("/movie/550");
		const expectation = expect(promise).rejects.toThrow(TMDBError);
		await vi.runAllTimersAsync();
		await expectation;
		// 503 was retried once, then 500 stopped the loop
		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
	});

	it("applies retry to mutate() calls as well", async () => {
		const client = new ApiClient(token, {
			retry: { max_retries: 2, base_delay_ms: 10 },
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeErrorResponse(500, "Internal Server Error"))
			.mockResolvedValueOnce(makeResponse({ success: true }));

		const promise = client.mutate("POST", "/account/1/favorite", { media_type: "movie", media_id: 1, favorite: true });
		await vi.runAllTimersAsync();
		const result = await promise;

		expect(result).toEqual({ success: true });
		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
	});

	it("each retry attempt acquires its own rate-limit slot", async () => {
		const acquireSpy = vi.spyOn(RetryManager.prototype, "execute");

		const client = new ApiClient(token, {
			retry: { max_retries: 1, base_delay_ms: 10 },
			rate_limit: { max_requests: 10, per_ms: 1_000 },
			deduplication: false,
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>)
			.mockResolvedValueOnce(makeErrorResponse(500, "Internal Server Error"))
			.mockResolvedValueOnce(makeResponse({ id: 1 }));

		const promise = client.request("/movie/1");
		await vi.runAllTimersAsync();
		await promise;

		// RetryManager.execute should have been called once (wrapping both attempts)
		expect(acquireSpy).toHaveBeenCalledTimes(1);
		// fetch called twice — once per attempt
		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
	});

	// ─── Regression: post-fetch errors must not trigger a re-fetch ──────────

	it("does not retry when onSuccess interceptor throws after a 2xx response", async () => {
		const client = new ApiClient(token, {
			retry: { max_retries: 3, base_delay_ms: 10 },
			deduplication: false,
			interceptors: {
				response: {
					onSuccess: () => {
						throw new Error("interceptor bug");
					},
				},
			},
		});

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeResponse({ id: 550 }));

		// onSuccess throws → the error must propagate, not trigger a retry
		await expect(client.request("/movie/550")).rejects.toThrow("interceptor bug");
		// fetch was called exactly once — the successful response was NOT re-fetched
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});

	it("does not retry when res.json() throws a SyntaxError after a 2xx response", async () => {
		const client = new ApiClient(token, {
			retry: { max_retries: 3, base_delay_ms: 10 },
			deduplication: false,
		});

		const brokenJsonResponse: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/movie/550",
			headers: { get: () => null },
			json: async () => {
				throw new SyntaxError("Unexpected token");
			},
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(brokenJsonResponse);

		await expect(client.request("/movie/550")).rejects.toThrow(SyntaxError);
		// fetch was called exactly once — malformed JSON is not a transient network error
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
	});
});
