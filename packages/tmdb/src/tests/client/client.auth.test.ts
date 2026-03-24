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

// These are mock values — fetch is fully mocked, so real credentials are not needed
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwfQ.signature";
const key = "test_api_key_v3";

describe("ApiClient auth", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("appends v3 API key as query string when token is not JWT", async () => {
		const client = new ApiClient(key);

		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/test",
			headers: makeHeaders({}),
			json: async () => ({}),
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		await client.request("/test", { language: "en-US" });

		const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
		const calledOptions = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
			headers: Record<string, string>;
		};

		expect(calledUrl).toContain("language=en-US");
		expect(calledUrl).toContain(`api_key=${key}`);
		expect(calledOptions.headers.Authorization).toBeUndefined();
	});

	it("sends JWT as Bearer header", async () => {
		const client = new ApiClient(token);

		const response: MockResponse = {
			ok: true,
			status: 200,
			statusText: "OK",
			url: "https://api.themoviedb.org/3/test",
			headers: makeHeaders({}),
			json: async () => ({}),
		};

		(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(response);

		await client.request("/test");

		const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
		const calledOptions = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
			headers: Record<string, string>;
		};

		expect(calledUrl).not.toContain("token=");
		expect(calledOptions.headers.Authorization).toBe(`Bearer ${token}`);
	});
});
