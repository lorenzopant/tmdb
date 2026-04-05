/// <reference types="node" />
import { describe, expect, it, vi, beforeEach } from "vitest";

import { TMDB } from "../tmdb";
import { TMDBv4 } from "../tmdb.v4";
import { ApiClient } from "../client";
import { MoviesAPI } from "../endpoints/movies";
import { GenresAPI } from "../endpoints/genres";
import { Errors } from "../errors/messages";

describe("TMDB API Client", () => {
	it("should throw an error if no access token is provided", () => {
		expect(() => new TMDB("")).toThrowError(Errors.NO_ACCESS_TOKEN);
	});

	it("should create an instance of TMDB with a valid access token", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb).toBeInstanceOf(TMDB);
	});

	it("should expose the discover api", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb.discover).toBeDefined();
	});

	it("should expose the find api", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb.find).toBeDefined();
	});

	it("should expose the watch providers api", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb.watch_providers).toBeDefined();
	});

	it("should expose the keywords api", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb.keywords).toBeDefined();
	});

	it("should expose the networks api", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb.networks).toBeDefined();
	});

	it("should expose the people api", () => {
		const tmdb = new TMDB("valid_access_token");
		expect(tmdb.people).toBeDefined();
	});
});

// Minimal helper — mirrors the one in utils/jwt.test.ts
function toBase64Url(value: string): string {
	const bytes = new TextEncoder().encode(value);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function makeJwt(): string {
	const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
	const payload = toBase64Url(JSON.stringify({ sub: "test", iat: 1, exp: 9999999999 }));
	return `${header}.${payload}.signature`;
}

describe("TMDB.v4 — lazy getter", () => {
	it("throws V4_REQUIRES_JWT when the instance was created with a plain API key", () => {
		const tmdb = new TMDB("plain-api-key");
		expect(() => tmdb.v4).toThrow(Errors.V4_REQUIRES_JWT);
	});

	it("returns a TMDBv4 instance when the token is a valid JWT", () => {
		const tmdb = new TMDB(makeJwt());
		expect(tmdb.v4).toBeInstanceOf(TMDBv4);
	});

	it("returns the same cached TMDBv4 instance on repeated access", () => {
		const tmdb = new TMDB(makeJwt());
		expect(tmdb.v4).toBe(tmdb.v4);
	});

	it("exposes auth, account and lists namespaces on the v4 instance", () => {
		const tmdb = new TMDB(makeJwt());
		expect(tmdb.v4.auth).toBeDefined();
		expect(tmdb.v4.account).toBeDefined();
		expect(tmdb.v4.lists).toBeDefined();
	});
});

describe("TMDBAPIBase — standalone constructor", () => {
	describe("string access token", () => {
		it("should create an instance when a valid access token is provided", () => {
			expect(new MoviesAPI("valid_access_token")).toBeInstanceOf(MoviesAPI);
		});

		it("should throw NO_ACCESS_TOKEN when an empty string is provided", () => {
			expect(() => new MoviesAPI("")).toThrowError(Errors.NO_ACCESS_TOKEN);
		});

		it("should throw NO_ACCESS_TOKEN when null is passed (JS consumers)", () => {
			expect(() => new MoviesAPI(null as any)).toThrowError(Errors.NO_ACCESS_TOKEN);
		});

		it("should throw NO_ACCESS_TOKEN when undefined is passed (JS consumers)", () => {
			expect(() => new MoviesAPI(undefined as any)).toThrowError(Errors.NO_ACCESS_TOKEN);
		});

		it("should throw INVALID_CLIENT when an arbitrary object is passed", () => {
			expect(() => new MoviesAPI({} as any)).toThrowError(Errors.INVALID_CLIENT);
		});

		it("should forward defaultOptions and apply language to requests", async () => {
			const requestSpy = vi.spyOn(ApiClient.prototype, "request").mockResolvedValueOnce({ genres: [] });
			const api = new GenresAPI("valid_access_token", { language: "it-IT" });
			await api.movie_list();
			expect(requestSpy).toHaveBeenCalledWith("/genre/movie/list", { language: "it-IT" });
		});

		it("should allow per-call params to override defaultOptions", async () => {
			vi.spyOn(ApiClient.prototype, "request").mockResolvedValueOnce({ genres: [] });
			const api = new GenresAPI("valid_access_token", { language: "fr-FR" });
			await api.movie_list({ language: "de-DE" });
			expect(ApiClient.prototype.request).toHaveBeenCalledWith("/genre/movie/list", {
				language: "de-DE",
			});
		});
	});

	describe("ApiClient instance", () => {
		let clientMock: ApiClient;

		beforeEach(() => {
			clientMock = new ApiClient("valid_access_token");
			clientMock.request = vi.fn();
		});

		it("should use the provided ApiClient directly", async () => {
			const api = new MoviesAPI(clientMock);
			await api.details({ movie_id: 550 });
			expect(clientMock.request).toHaveBeenCalledOnce();
		});

		it("should respect defaultOptions passed alongside an ApiClient", async () => {
			const api = new GenresAPI(clientMock, { language: "ja-JP" });
			await api.movie_list();
			expect(clientMock.request).toHaveBeenCalledWith("/genre/movie/list", { language: "ja-JP" });
		});
	});
});
