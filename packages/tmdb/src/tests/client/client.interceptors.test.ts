import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { TMDB } from "../../tmdb";
import { RequestContext, ResponseContext } from "../../types/interceptors";

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

describe("ApiClient request interceptors", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn().mockResolvedValue(okResponse({ id: 1 }));
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("should run a construction-time request interceptor before the request", async () => {
		const interceptor = vi.fn((ctx: RequestContext) => ctx);
		const client = new ApiClient("valid_access_token", { interceptors: { request: [interceptor] } });

		await client.request("/movie/550");

		expect(interceptor).toHaveBeenCalledOnce();
		expect(interceptor.mock.calls[0][0]).toMatchObject({
			endpoint: "/movie/550",
			headers: expect.objectContaining({ Authorization: "Bearer valid_access_token" }),
		});
	});

	it('should run a use("request")-registered interceptor before the request', async () => {
		const interceptor = vi.fn((ctx: RequestContext) => ctx);
		const client = new ApiClient("valid_access_token");
		client.use("request", interceptor);

		await client.request("/movie/550");

		expect(interceptor).toHaveBeenCalledOnce();
	});

	it("should allow interceptor to inject a custom header", async () => {
		const client = new ApiClient("valid_access_token");
		client.use("request", (ctx) => ({
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
		client.use("request", (ctx) => ({
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
		client.use("request", (ctx) => ({ ...ctx, endpoint: "/movie/999" }));

		await client.request("/movie/550");

		const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(fetchCall[0]).toContain("/movie/999");
		expect(fetchCall[0]).not.toContain("/movie/550");
	});

	it("should support async request interceptors", async () => {
		const client = new ApiClient("valid_access_token");
		client.use("request", async (ctx) => {
			await Promise.resolve();
			return { ...ctx, headers: { ...ctx.headers, "X-Async": "yes" } };
		});

		await client.request("/movie/550");

		const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		const headers = fetchCall[1]?.headers as Record<string, string>;
		expect(headers["X-Async"]).toBe("yes");
	});

	it("should run multiple request interceptors in registration order", async () => {
		const order: number[] = [];
		const client = new ApiClient("valid_access_token");
		client.use("request", (ctx) => {
			order.push(1);
			return ctx;
		});
		client.use("request", (ctx) => {
			order.push(2);
			return ctx;
		});
		client.use("request", (ctx) => {
			order.push(3);
			return ctx;
		});

		await client.request("/movie/550");

		expect(order).toEqual([1, 2, 3]);
	});

	it("should propagate errors thrown by a request interceptor", async () => {
		const client = new ApiClient("valid_access_token");
		client.use("request", () => {
			throw new Error("interceptor error");
		});

		await expect(client.request("/movie/550")).rejects.toThrow("interceptor error");
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it("construction-time request interceptors and use() interceptors run together in order", async () => {
		const order: string[] = [];
		const client = new ApiClient("valid_access_token", {
			interceptors: {
				request: [
					(ctx) => {
						order.push("constructor");
						return ctx;
					},
				],
			},
		});
		client.use("request", (ctx) => {
			order.push("use");
			return ctx;
		});

		await client.request("/movie/550");

		expect(order).toEqual(["constructor", "use"]);
	});
});

describe("ApiClient response interceptors", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn().mockResolvedValue(okResponse({ id: 42, title: "Inception" }));
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("should call a construction-time response interceptor with correct context", async () => {
		const interceptor = vi.fn(<T>(ctx: ResponseContext<T>) => ctx.data);
		const client = new ApiClient("valid_access_token", { interceptors: { response: [interceptor] } });

		await client.request("/movie/550");

		expect(interceptor).toHaveBeenCalledOnce();
		const ctx = interceptor.mock.calls[0][0] as ResponseContext<unknown>;
		expect(ctx.status).toBe(200);
		expect(ctx.request.endpoint).toBe("/movie/550");
		expect(ctx.data).toEqual({ id: 42, title: "Inception" });
	});

	it('should call a use("response")-registered response interceptor', async () => {
		const interceptor = vi.fn(<T>(ctx: ResponseContext<T>) => ctx.data);
		const client = new ApiClient("valid_access_token");
		client.use("response", interceptor);

		await client.request("/movie/550");

		expect(interceptor).toHaveBeenCalledOnce();
	});

	it("should allow a response interceptor to transform the data", async () => {
		const client = new ApiClient("valid_access_token");
		client.use("response", <T>(ctx: ResponseContext<T>) => ({ ...(ctx.data as object), extra: "injected" }) as T);

		const result = await client.request<Record<string, unknown>>("/movie/550");

		expect(result.extra).toBe("injected");
		expect(result.id).toBe(42);
	});

	it("should support async response interceptors", async () => {
		const client = new ApiClient("valid_access_token");
		client.use("response", async <T>(ctx: ResponseContext<T>) => {
			await Promise.resolve();
			return { ...(ctx.data as object), async: true } as T;
		});

		const result = await client.request<Record<string, unknown>>("/movie/550");

		expect(result.async).toBe(true);
	});

	it("should run multiple response interceptors in registration order, chaining data", async () => {
		const client = new ApiClient("valid_access_token");
		client.use("response", <T>(ctx: ResponseContext<T>) => ({ ...(ctx.data as object), step1: true }) as T);
		client.use("response", <T>(ctx: ResponseContext<T>) => ({ ...(ctx.data as object), step2: true }) as T);

		const result = await client.request<Record<string, unknown>>("/movie/550");

		expect(result.step1).toBe(true);
		expect(result.step2).toBe(true);
	});

	it("should propagate errors thrown by a response interceptor", async () => {
		const client = new ApiClient("valid_access_token");
		client.use("response", () => {
			throw new Error("response interceptor error");
		});

		await expect(client.request("/movie/550")).rejects.toThrow("response interceptor error");
	});

	it("should not call response interceptors for failed requests", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			statusText: "Not Found",
			json: async () => ({ status_message: "Not found", status_code: 34 }),
		});
		const interceptor = vi.fn(<T>(ctx: ResponseContext<T>) => ctx.data);
		const client = new ApiClient("valid_access_token", { interceptors: { response: [interceptor] } });

		await expect(client.request("/movie/999999")).rejects.toThrow();
		expect(interceptor).not.toHaveBeenCalled();
	});

	it("construction-time response interceptors and use() interceptors run together in order", async () => {
		const order: string[] = [];
		const client = new ApiClient("valid_access_token", {
			interceptors: {
				response: [
					<T>(ctx: ResponseContext<T>) => {
						order.push("constructor");
						return ctx.data;
					},
				],
			},
		});
		client.use("response", <T>(ctx: ResponseContext<T>) => {
			order.push("use");
			return ctx.data;
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

	it('should register a request interceptor via tmdb.use("request") and inject a header', async () => {
		const tmdb = new TMDB("valid_access_token");
		tmdb.use("request", (ctx) => ({
			...ctx,
			headers: { ...ctx.headers, "X-Via-TMDB": "1" },
		}));

		await tmdb.movie_lists.popular({});

		const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		const headers = fetchCall[1]?.headers as Record<string, string>;
		expect(headers["X-Via-TMDB"]).toBe("1");
	});

	it('should register a response interceptor via tmdb.use("response")', async () => {
		const interceptor = vi.fn(<T>(ctx: ResponseContext<T>) => ctx.data);
		const tmdb = new TMDB("valid_access_token");
		tmdb.use("response", interceptor);

		await tmdb.movie_lists.popular({});

		expect(interceptor).toHaveBeenCalledOnce();
	});

	it("should return this from use() to allow chaining", () => {
		const tmdb = new TMDB("valid_access_token");
		const result = tmdb.use("request", (ctx) => ctx);
		expect(result).toBe(tmdb);
	});

	it("should allow chaining request and response interceptors together", () => {
		const tmdb = new TMDB("valid_access_token");
		const result = tmdb.use("request", (ctx) => ctx).use("response", <T>(ctx: ResponseContext<T>) => ctx.data);
		expect(result).toBe(tmdb);
	});

	it("should support construction-time interceptors.request via options", async () => {
		const interceptor = vi.fn((ctx: RequestContext) => ctx);
		const tmdb = new TMDB("valid_access_token", { interceptors: { request: [interceptor] } });

		await tmdb.movie_lists.popular({});

		expect(interceptor).toHaveBeenCalledOnce();
	});

	it("should support construction-time interceptors.response via options", async () => {
		const interceptor = vi.fn(<T>(ctx: ResponseContext<T>) => ctx.data);
		const tmdb = new TMDB("valid_access_token", { interceptors: { response: [interceptor] } });

		await tmdb.movie_lists.popular({});

		expect(interceptor).toHaveBeenCalledOnce();
	});
});
