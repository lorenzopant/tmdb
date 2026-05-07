import { TMDBAPIErrorResponse, TMDBError } from "./errors/tmdb";
import { ImageAPI } from "./images/images";
import type { ImagesConfig } from "./types/config/images";
import { TMDBLogger, TMDBLoggerFn } from "./utils/logger";
import { ResponseCache } from "./utils/cache";
import type { CacheOptions } from "./utils/cache";
import { RateLimiter } from "./utils/rate-limiter";
import type { RateLimitOptions } from "./utils/rate-limiter";
import { RetryManager } from "./utils/retry";
import type { RetryOptions } from "./utils/retry";
import { isJwt } from "./utils";
import type {
	RequestInterceptor,
	RequestInterceptorContext,
	ResponseSuccessInterceptor,
	ResponseErrorInterceptor,
} from "./types/config/options";

export class ApiClient {
	private accessToken: string;
	private baseUrl: string;
	private logger?: TMDBLogger;
	/**
	 * Tracks in-flight requests keyed by a deterministic string derived from the endpoint
	 * and its parameters. When two identical requests are fired concurrently, the second
	 * caller receives the same Promise as the first — only one fetch is made.
	 * Entries are removed via `.finally()` so the map never holds settled promises.
	 */
	private inflightRequests: Map<string, Promise<unknown>> = new Map();
	private deduplication: boolean;
	private rateLimiter?: RateLimiter;
	private retryManager?: RetryManager;
	private requestInterceptors: RequestInterceptor[];
	private onSuccessInterceptor?: ResponseSuccessInterceptor;
	private onErrorInterceptor?: ResponseErrorInterceptor;
	private imageApi?: ImageAPI;
	private imageOptions?: ImagesConfig;
	private responseCache?: ResponseCache;

	constructor(
		accessToken: string,
		options: {
			/** @internal API version to target. Used by TMDBv4 — not exposed in TMDBOptions. */
			version?: 3 | 4;
			logger?: boolean | TMDBLoggerFn;
			deduplication?: boolean;
			images?: ImagesConfig;
			rate_limit?: boolean | RateLimitOptions;
			retry?: boolean | RetryOptions;
			cache?: boolean | CacheOptions;
			interceptors?: {
				request?: RequestInterceptor | RequestInterceptor[];
				response?: { onSuccess?: ResponseSuccessInterceptor; onError?: ResponseErrorInterceptor };
			};
		} = {},
	) {
		this.accessToken = accessToken;
		this.baseUrl = `https://api.themoviedb.org/${options.version ?? 3}`;
		this.logger = TMDBLogger.from(options.logger);
		this.deduplication = options.deduplication !== false;
		if (options.rate_limit) {
			const rlOpts = options.rate_limit === true ? {} : options.rate_limit;
			this.rateLimiter = new RateLimiter(rlOpts);
		}
		if (options.retry) {
			const retryOpts = options.retry === true ? {} : options.retry;
			this.retryManager = new RetryManager(retryOpts);
		}
		if (options.cache) {
			const cOpts = options.cache === true ? {} : options.cache;
			this.responseCache = new ResponseCache(cOpts);
		}
		const raw = options.interceptors?.request;
		this.requestInterceptors = raw == null ? [] : Array.isArray(raw) ? raw : [raw];
		this.onSuccessInterceptor = options.interceptors?.response?.onSuccess;
		this.onErrorInterceptor = options.interceptors?.response?.onError;
		this.imageApi =
			options.images?.autocomplete_paths || options.images?.fallback_url
				? new ImageAPI(options.images)
				: undefined;
		this.imageOptions = options.images;
	}

	/**
	 * Builds a stable, order-independent cache key for a request.
	 *
	 * `undefined` values are excluded (they are never serialised into the URL),
	 * and the remaining entries are sorted alphabetically before joining so that
	 * `{ language, page }` and `{ page, language }` produce the same key.
	 */
	private buildRequestKey(endpoint: string, params: Record<string, unknown>): string {
		const definedEntries = this.serializeParams(params)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([key, value]) => `${key}=${value}`);
		return definedEntries.length > 0 ? `${endpoint}?${definedEntries.join("&")}` : endpoint;
	}

	/**
	 * Serializes request params once so URL construction and deduplication keys stay aligned.
	 * `undefined` values are intentionally skipped because they are not sent to TMDB.
	 */
	private serializeParams(params: Record<string, unknown | undefined>): Array<[string, string]> {
		return Object.entries(params).flatMap(([key, value]) => {
			if (value === undefined) return [];
			return [[key, String(value)]];
		});
	}

	/**
	 * Makes an authenticated GET request to the TMDB API, returning the parsed and
	 * null-sanitised response.
	 *
	 * **Deduplication:** when enabled (the default), concurrent calls with the same
	 * `endpoint` + `params` share a single in-flight fetch. The second (and any
	 * subsequent) caller receives the same `Promise` — no extra network request is made.
	 * Once the promise settles (success or error) it is evicted from the map so the next
	 * call triggers a fresh fetch. Deduplication can be disabled globally via
	 * `TMDBOptions.deduplication = false`.
	 */
	async request<T>(endpoint: string, params: Record<string, unknown | undefined> = {}): Promise<T> {
		// Run interceptors first so the cache/dedup key is derived from the request
		// that will actually be sent — not the raw pre-interceptor values.
		const ctx = await this.runRequestInterceptors({
			endpoint,
			params: params as Record<string, unknown>,
			method: "GET",
		});
		const effectiveEndpoint = ctx.endpoint;
		const effectiveParams = ctx.params;

		const key = this.buildRequestKey(effectiveEndpoint, effectiveParams);
		const cacheable = !!this.responseCache?.shouldCache(key);

		// Cache check — short-circuit before deduplication and any network activity.
		// Use has() rather than checking the value against undefined so that a cached
		// undefined value (e.g. an endpoint that returned null, sanitised to undefined)
		// is correctly treated as a hit.
		if (cacheable && this.responseCache!.has(key)) return this.responseCache!.get<T>(key) as T;

		if (!this.deduplication) {
			const result = await this.execute<T>(
				"GET",
				effectiveEndpoint,
				effectiveParams,
				undefined,
				true,
			);
			if (cacheable) this.responseCache!.set(key, result);
			return result;
		}

		const existing = this.inflightRequests.get(key);
		if (existing) return existing as Promise<T>;

		const cache = cacheable ? this.responseCache : undefined;
		const promise = this.execute<T>("GET", effectiveEndpoint, effectiveParams, undefined, true)
			.then((result) => {
				cache?.set(key, result);
				return result;
			})
			.finally(() => {
				this.inflightRequests.delete(key);
			});
		this.inflightRequests.set(key, promise);
		return promise;
	}

	/**
	 * Removes a single entry from the response cache.
	 *
	 * The key is built from `endpoint` + `params` using the same deterministic algorithm
	 * as the cache itself, so the arguments must match exactly what was used in the original
	 * request (including parameter values and casing).
	 *
	 * @returns `true` if an entry was found and removed, `false` if it was not cached.
	 */
	invalidateCache(endpoint: string, params: Record<string, unknown> = {}): boolean {
		if (!this.responseCache) return false;
		return this.responseCache.delete(this.buildRequestKey(endpoint, params));
	}

	/** Removes all entries from the response cache. */
	clearCache(): void {
		this.responseCache?.clear();
	}

	/** Returns the number of entries currently held in the response cache. */
	get cacheSize(): number {
		return this.responseCache?.size ?? 0;
	}

	/**
	 * Runs all registered request interceptors in order, threading the context through each one.
	 * If an interceptor returns a new context, it replaces the current context for the next interceptor.
	 */
	private async runRequestInterceptors(
		context: RequestInterceptorContext,
	): Promise<RequestInterceptorContext> {
		let current = context;
		for (const interceptor of this.requestInterceptors) {
			const result = await interceptor(current);
			if (result != null) current = result;
		}
		return current;
	}

	/**
	 * Recursively converts null values to undefined in API responses.
	 * This allows optional properties to model fields that TMDB returns as nullable.
	 * Response types for nullable fields should account for possible undefined values.
	 */
	private sanitizeNulls<T>(value: unknown): T {
		// Only convert null to undefined, keep undefined as-is
		if (value === null) {
			return undefined as T;
		}

		if (typeof value !== "object") {
			return value as T;
		}

		if (Array.isArray(value)) {
			return value.map((v) => this.sanitizeNulls<unknown>(v)) as T;
		}

		const sanitized: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
			sanitized[key] = this.sanitizeNulls<unknown>(val);
		}
		return sanitized as T;
	}

	private async normalizeError(
		res: Response,
		endpoint: string,
		method: "GET" | "POST" | "PUT" | "DELETE",
	): Promise<TMDBError> {
		let errorMessage = res.statusText;
		let tmdbStatusCode: number = -1;

		try {
			const errorBody = await res.json();
			if (errorBody && typeof errorBody === "object") {
				const err: TMDBAPIErrorResponse = errorBody;
				errorMessage = err.status_message || errorMessage;
				tmdbStatusCode = err.status_code || -1;
			}
		} catch (error) {
			console.error(`Unknown error: ${error}`);
			// If response is not JSON, fallback to HTTP status text
		}

		this.logger?.log({
			type: "error",
			method,
			endpoint,
			status: res.status,
			statusText: res.statusText,
			tmdbStatusCode,
			errorMessage,
		});

		return new TMDBError(errorMessage, res.status, tmdbStatusCode);
	}

	private async notifyErrorInterceptor(error: TMDBError): Promise<void> {
		if (this.onErrorInterceptor) {
			await this.onErrorInterceptor(error);
		}
	}

	/**
	 * Makes an authenticated mutation request to the TMDB API.
	 * Unlike `request()`, mutations are **never deduplicated** since they change server state.
	 *
	 * Accepts `"GET"` in addition to the standard mutation verbs for the rare TMDB endpoints
	 * (e.g. `GET /4/list/{id}/clear`) that are specified as GET but carry side effects and
	 * must therefore not be collapsed by the deduplication layer.
	 *
	 * @param method - HTTP method to use
	 * @param endpoint - API path (e.g. "/account/123/favorite")
	 * @param body - JSON body to send (omit for DELETE/GET requests without a body)
	 * @param params - Optional query string parameters (e.g. session_id)
	 */
	async mutate<T>(
		method: "GET" | "POST" | "PUT" | "DELETE",
		endpoint: string,
		body?: Record<string, unknown>,
		params: Record<string, unknown | undefined> = {},
	): Promise<T> {
		return this.execute<T>(method, endpoint, params, body);
	}

	/**
	 * Shared fetch + response-parsing pipeline used by both `request` and `mutate`.
	 * Handles URL construction, auth, logging, error mapping, and null sanitisation.
	 *
	 * When called from `request()`, interceptors have already been applied and
	 * `endpoint`/`params` are the effective (post-interceptor) values — interceptors
	 * are skipped. When called from `mutate()`, interceptors run here as normal.
	 */
	private async execute<T>(
		method: "GET" | "POST" | "PUT" | "DELETE",
		endpoint: string,
		params: Record<string, unknown | undefined>,
		body?: Record<string, unknown>,
		/** Pass `true` when the caller has already applied request interceptors. */
		interceptorsAlreadyApplied = false,
	): Promise<T> {
		// Serialise the body before acquiring a rate-limit slot so a JSON.stringify
		// error never consumes budget without a matching network request.
		const bodyJson = body !== undefined ? JSON.stringify(body) : undefined;

		let effectiveEndpoint: string;
		let effectiveParams: Record<string, unknown>;

		if (interceptorsAlreadyApplied) {
			effectiveEndpoint = endpoint;
			effectiveParams = params as Record<string, unknown>;
		} else {
			const ctx = await this.runRequestInterceptors({
				endpoint,
				params: params as Record<string, unknown>,
				method,
			});
			effectiveEndpoint = ctx.endpoint;
			effectiveParams = ctx.params;
		}

		const url = new URL(`${this.baseUrl}${effectiveEndpoint}`);
		const jwt = isJwt(this.accessToken);

		for (const [key, value] of this.serializeParams(effectiveParams)) {
			url.searchParams.append(key, value);
		}
		if (!jwt) {
			url.searchParams.append("api_key", this.accessToken);
		}

		const startedAt = Date.now();
		this.logger?.log({
			type: "request",
			method,
			endpoint: effectiveEndpoint,
		});

		// Retry boundary: only the fetch + HTTP-status check.
		// JSON parsing and onSuccessInterceptor run *outside* the retried closure so
		// that a SyntaxError from res.json() or a bug in onSuccess never causes a
		// re-fetch (which would duplicate side-effectful mutations).
		const attemptFetch = async (): Promise<Response> => {
			// Acquire a rate-limit slot immediately before the fetch so interceptor
			// errors or serialisation failures never consume budget unnecessarily.
			if (this.rateLimiter) await this.rateLimiter.acquire();

			let res: Response;
			try {
				res = await fetch(url.toString(), {
					method,
					headers: jwt
						? {
								Authorization: `Bearer ${this.accessToken}`,
								"Content-Type": "application/json;charset=utf-8",
							}
						: {
								"Content-Type": "application/json;charset=utf-8",
							},
					...(bodyJson !== undefined ? { body: bodyJson } : {}),
				});
			} catch (error) {
				this.logger?.log({
					type: "error",
					method,
					endpoint: effectiveEndpoint,
					errorMessage: error instanceof Error ? error.message : String(error),
					durationMs: Date.now() - startedAt,
				});
				throw error;
			}

			if (!res.ok) throw await this.normalizeError(res, effectiveEndpoint, method);
			return res;
		};

		let res: Response;
		try {
			res = this.retryManager
				? await this.retryManager.execute(attemptFetch)
				: await attemptFetch();
		} catch (error) {
			if (error instanceof TMDBError) {
				await this.notifyErrorInterceptor(error);
			}
			throw error;
		}

		this.logger?.log({
			type: "response",
			method,
			endpoint: effectiveEndpoint,
			status: res.status,
			statusText: res.statusText,
			durationMs: Date.now() - startedAt,
		});

		const data = await res.json();
		const sanitized = this.sanitizeNulls<T>(data);
		const transformed = this.imageApi
			? this.imageOptions?.autocomplete_paths
				? this.imageApi.autocompleteImagePaths(sanitized)
				: this.imageApi.applyFallbacksOnly(sanitized)
			: sanitized;

		if (this.onSuccessInterceptor) {
			const result = await this.onSuccessInterceptor(transformed);
			return result !== undefined ? (result as T) : transformed;
		}

		return transformed;
	}
}
