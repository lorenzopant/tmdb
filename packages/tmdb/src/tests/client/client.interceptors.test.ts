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
const token =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwfQ.signature";

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

		const calledUrl = new URL(
			(globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string,
		);
		expect(calledUrl.searchParams.get("language")).toBe("fr-FR");
	});

	it("allows an interceptor to modify the endpoint", async () => {
		const client = new ApiClient(token, {
			interceptors: {
				request: (ctx) => ({ ...ctx, endpoint: "/movie/999" }),
			},
		});

		await client.request("/movie/1");

		const calledUrl = new URL(
			(globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string,
		);
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

		const calledUrl = new URL(
			(globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string,
		);
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

		const calledUrl = new URL(
			(globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string,
		);
		expect(calledUrl.pathname).toBe("/3/movie/1");
		expect(calledUrl.searchParams.get("language")).toBe("en-US");
	});

	it("works when no interceptors are configured", async () => {
		const client = new ApiClient(token);

		await client.request("/movie/1", { language: "en-US" });

		expect(globalThis.fetch).toHaveBeenCalledOnce();
	});
});
