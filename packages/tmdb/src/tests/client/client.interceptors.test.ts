import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { TMDB } from "../../tmdb";
import { RequestContext } from "../../types/interceptors";

type MockResponse = {
	ok: boolean;
	status: number;
	statusText: string;
	json: () => Promise<unknown>;
};

const okResponse = (body: unknown = {}): MockResponse => ({
	ok: true,
	status: 200,
	statusText: "OK",
	json: async () => body,
});

describe("ApiClient interceptors", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn().mockResolvedValue(okResponse({ id: 1 }));
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("should run a construction-time interceptor before the request", async () => {
		const interceptor = vi.fn((ctx: RequestContext) => ctx);
		const client = new ApiClient("valid_access_token", { interceptors: [interceptor] });

		await client.request("/movie/550");

		expect(interceptor).toHaveBeenCalledOnce();
		expect(interceptor.mock.calls[0][0]).toMatchObject({
			endpoint: "/movie/550",
			headers: expect.objectContaining({ Authorization: "Bearer valid_access_token" }),
		});
	});

	it("should run a use()-registered interceptor before the request", async () => {
		const interceptor = vi.fn((ctx: RequestContext) => ctx);
		const client = new ApiClient("valid_access_token");
		client.use(interceptor);

		await client.request("/movie/550");

		expect(interceptor).toHaveBeenCalledOnce();
	});

	it("should allow interceptor to inject a custom header", async () => {
		const client = new ApiClient("valid_access_token");
		client.use((ctx) => ({
			...ctx,
			headers: { ...ctx.headers, "X-Custom-Header": "my-value" },
		}));

		await client.request("/movie/550");

		const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		const headers = fetchCall[1]?.headers as Record<string, string>;
		expect(headers["X-Custom-Header"]).toBe("my-value");
		expect(headers["Authorization"]).toBe("Bearer valid_access_token");
	});

	it("should allow interceptor to modify params", async () => {
		const client = new ApiClient("valid_access_token");
		client.use((ctx) => ({
			...ctx,
			params: { ...ctx.params, extra_param: "123" },
		}));

		await client.request("/movie/550", { language: "en-US" });

		const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		const url = new URL(fetchCall[0] as string);
		expect(url.searchParams.get("extra_param")).toBe("123");
		expect(url.searchParams.get("language")).toBe("en-US");
	});

	it("should allow interceptor to modify the endpoint", async () => {
		const client = new ApiClient("valid_access_token");
		client.use((ctx) => ({ ...ctx, endpoint: "/movie/999" }));

		await client.request("/movie/550");

		const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(fetchCall[0]).toContain("/movie/999");
		expect(fetchCall[0]).not.toContain("/movie/550");
	});

	it("should support async interceptors", async () => {
		const client = new ApiClient("valid_access_token");
		client.use(async (ctx) => {
			await Promise.resolve();
			return { ...ctx, headers: { ...ctx.headers, "X-Async": "yes" } };
		});

		await client.request("/movie/550");

		const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		const headers = fetchCall[1]?.headers as Record<string, string>;
		expect(headers["X-Async"]).toBe("yes");
	});

	it("should run multiple interceptors in registration order", async () => {
		const order: number[] = [];
		const client = new ApiClient("valid_access_token");
		client.use((ctx) => {
			order.push(1);
			return ctx;
		});
		client.use((ctx) => {
			order.push(2);
			return ctx;
		});
		client.use((ctx) => {
			order.push(3);
			return ctx;
		});

		await client.request("/movie/550");

		expect(order).toEqual([1, 2, 3]);
	});

	it("should propagate errors thrown by an interceptor", async () => {
		const client = new ApiClient("valid_access_token");
		client.use(() => {
			throw new Error("interceptor error");
		});

		await expect(client.request("/movie/550")).rejects.toThrow("interceptor error");
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it("construction-time interceptors and use() interceptors run together in order", async () => {
		const order: string[] = [];
		const client = new ApiClient("valid_access_token", {
			interceptors: [
				(ctx) => {
					order.push("constructor");
					return ctx;
				},
			],
		});
		client.use((ctx) => {
			order.push("use");
			return ctx;
		});

		await client.request("/movie/550");

		expect(order).toEqual(["constructor", "use"]);
	});
});

describe("TMDB.use()", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn().mockResolvedValue(okResponse({ id: 1, results: [] }));
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("should register an interceptor via tmdb.use() and inject a header", async () => {
		const tmdb = new TMDB("valid_access_token");
		tmdb.use((ctx) => ({
			...ctx,
			headers: { ...ctx.headers, "X-Via-TMDB": "1" },
		}));

		await tmdb.movie_lists.popular({});

		const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		const headers = fetchCall[1]?.headers as Record<string, string>;
		expect(headers["X-Via-TMDB"]).toBe("1");
	});

	it("should return this from use() to allow chaining", () => {
		const tmdb = new TMDB("valid_access_token");
		const result = tmdb.use((ctx) => ctx);
		expect(result).toBe(tmdb);
	});

	it("should support construction-time interceptors via options.interceptors", async () => {
		const interceptor = vi.fn((ctx: RequestContext) => ctx);
		const tmdb = new TMDB("valid_access_token", { interceptors: [interceptor] });

		await tmdb.movie_lists.popular({});

		expect(interceptor).toHaveBeenCalledOnce();
	});
});
