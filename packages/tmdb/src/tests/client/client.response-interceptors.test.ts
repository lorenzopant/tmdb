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

const makeOkResponse = (body: unknown = { id: 1 }): MockResponse => ({
	ok: true,
	status: 200,
	statusText: "OK",
	url: "https://api.themoviedb.org/3/movie/1",
	headers: makeHeaders({}),
	json: async () => body,
});

const makeErrorResponse = (
	status = 401,
	body: unknown = { success: false, status_code: 7, status_message: "Invalid API key." },
): MockResponse => ({
	ok: false,
	status,
	statusText: "Unauthorized",
	url: "https://api.themoviedb.org/3/movie/1",
	headers: makeHeaders({}),
	json: async () => body,
});

// Hardcoded mock JWT — fetch is fully mocked, so a real token is not needed
const token =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwfQ.signature";

describe("ApiClient response interceptors — onSuccess", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn().mockResolvedValue(makeOkResponse({ id: 42, name: "Fight Club" }));
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("calls onSuccess with the sanitized response data", async () => {
		const onSuccess = vi.fn();
		const client = new ApiClient(token, { interceptors: { response: { onSuccess } } });

		await client.request("/movie/42");

		expect(onSuccess).toHaveBeenCalledOnce();
		expect(onSuccess).toHaveBeenCalledWith({ id: 42, name: "Fight Club" });
	});

	it("returns the value from onSuccess when it returns a value", async () => {
		const client = new ApiClient(token, {
			interceptors: {
				response: {
					onSuccess: (data) => ({ ...(data as object), enriched: true }),
				},
			},
		});

		const result = await client.request<Record<string, unknown>>("/movie/42");

		expect(result.enriched).toBe(true);
		expect(result.id).toBe(42);
	});

	it("falls back to the original data when onSuccess returns void", async () => {
		const client = new ApiClient(token, {
			interceptors: {
				response: {
					onSuccess: (_data) => {
						// observe only — return nothing
					},
				},
			},
		});

		const result = await client.request<Record<string, unknown>>("/movie/42");

		expect(result).toEqual({ id: 42, name: "Fight Club" });
	});

	it("falls back to the original data when onSuccess returns undefined explicitly", async () => {
		const client = new ApiClient(token, {
			interceptors: {
				response: {
					onSuccess: (_data) => undefined,
				},
			},
		});

		const result = await client.request<Record<string, unknown>>("/movie/42");

		expect(result).toEqual({ id: 42, name: "Fight Club" });
	});

	it("awaits an async onSuccess interceptor", async () => {
		const onSuccess = vi.fn().mockResolvedValue(undefined);
		const client = new ApiClient(token, { interceptors: { response: { onSuccess } } });

		await client.request("/movie/42");

		expect(onSuccess).toHaveBeenCalledOnce();
	});

	it("does not call onSuccess when response is not ok", async () => {
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeErrorResponse());
		const onSuccess = vi.fn();
		const client = new ApiClient(token, { interceptors: { response: { onSuccess } } });

		await expect(client.request("/movie/42")).rejects.toBeInstanceOf(TMDBError);
		expect(onSuccess).not.toHaveBeenCalled();
	});
});

describe("ApiClient response interceptors — onError", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(
				makeErrorResponse(401, {
					success: false,
					status_code: 7,
					status_message: "Invalid API key.",
				}),
			);
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("calls onError with the normalised TMDBError", async () => {
		const onError = vi.fn();
		const client = new ApiClient(token, { interceptors: { response: { onError } } });

		await expect(client.request("/movie/42")).rejects.toBeInstanceOf(TMDBError);

		expect(onError).toHaveBeenCalledOnce();
		const received = onError.mock.calls[0][0];
		expect(received).toBeInstanceOf(TMDBError);
		expect(received.http_status_code).toBe(401);
		expect(received.tmdb_status_code).toBe(7);
		expect(received.message).toBe("Invalid API key.");
	});

	it("always re-throws the TMDBError even after onError runs", async () => {
		const client = new ApiClient(token, {
			interceptors: {
				response: {
					onError: (_err) => {
						// side effect only — no return
					},
				},
			},
		});

		await expect(client.request("/movie/42")).rejects.toBeInstanceOf(TMDBError);
	});

	it("awaits an async onError interceptor before re-throwing", async () => {
		const order: string[] = [];
		const client = new ApiClient(token, {
			interceptors: {
				response: {
					onError: async (_err) => {
						await Promise.resolve();
						order.push("onError");
					},
				},
			},
		});

		try {
			await client.request("/movie/42");
		} catch {
			order.push("thrown");
		}

		expect(order).toEqual(["onError", "thrown"]);
	});

	it("does not call onError on a successful response", async () => {
		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeOkResponse({ id: 1 }));
		const onError = vi.fn();
		const client = new ApiClient(token, { interceptors: { response: { onError } } });

		await client.request("/movie/42");

		expect(onError).not.toHaveBeenCalled();
	});
});
