import { TMDBAPIErrorResponse, TMDBError } from "./errors/tmdb";
import { TMDBLogger, TMDBLoggerFn } from "./utils/logger";
import { isJwt } from "./utils";
import type {
	RequestInterceptor,
	RequestInterceptorContext,
	ResponseSuccessInterceptor,
	ResponseErrorInterceptor,
} from "./types/config/options";

export class ApiClient {
	private accessToken: string;
	private baseUrl: string = "https://api.themoviedb.org/3";
	private logger?: TMDBLogger;
	/**
	 * Tracks in-flight requests keyed by a deterministic string derived from the endpoint
	 * and its parameters. When two identical requests are fired concurrently, the second
	 * caller receives the same Promise as the first — only one fetch is made.
	 * Entries are removed via `.finally()` so the map never holds settled promises.
	 */
	private inflightRequests: Map<string, Promise<unknown>> = new Map();
	private deduplication: boolean;
	private requestInterceptors: RequestInterceptor[];
	private onSuccessInterceptor?: ResponseSuccessInterceptor;
	private onErrorInterceptor?: ResponseErrorInterceptor;

	constructor(
		accessToken: string,
		options: {
			logger?: boolean | TMDBLoggerFn;
			deduplication?: boolean;
			interceptors?: {
				request?: RequestInterceptor | RequestInterceptor[];
				response?: { onSuccess?: ResponseSuccessInterceptor; onError?: ResponseErrorInterceptor };
			};
		} = {},
	) {
		this.accessToken = accessToken;
		this.logger = TMDBLogger.from(options.logger);
		this.deduplication = options.deduplication !== false;
		const raw = options.interceptors?.request;
		this.requestInterceptors = raw == null ? [] : Array.isArray(raw) ? raw : [raw];
		this.onSuccessInterceptor = options.interceptors?.response?.onSuccess;
		this.onErrorInterceptor = options.interceptors?.response?.onError;
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
		if (!this.deduplication) return this.doRequest<T>(endpoint, params);

		const key = this.buildRequestKey(endpoint, params);
		const existing = this.inflightRequests.get(key);
		if (existing) return existing as Promise<T>;

		const promise = this.doRequest<T>(endpoint, params).finally(() => {
			this.inflightRequests.delete(key);
		});
		this.inflightRequests.set(key, promise);
		return promise;
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
	 * The actual fetch + response-parsing pipeline. Called by `request()` only when no
	 * matching in-flight promise exists. Handles URL construction, auth headers, logging,
	 * error mapping, and null sanitisation.
	 */
	private async doRequest<T>(
		endpoint: string,
		params: Record<string, unknown | undefined>,
	): Promise<T> {
		const ctx = await this.runRequestInterceptors({ endpoint, params, method: "GET" });
		endpoint = ctx.endpoint;
		params = ctx.params;

		const url = new URL(`${this.baseUrl}${endpoint}`);
		const jwt = isJwt(this.accessToken);

		for (const [key, value] of this.serializeParams(params)) {
			url.searchParams.append(key, value);
		}

		if (!jwt) {
			url.searchParams.append("api_key", this.accessToken);
		}

		const startedAt = Date.now();
		this.logger?.log({
			type: "request",
			method: "GET",
			endpoint,
		});

		let res: Response;
		try {
			res = await fetch(url.toString(), {
				headers: jwt
					? {
							Authorization: `Bearer ${this.accessToken}`,
							"Content-Type": "application/json;charset=utf-8",
						}
					: {
							"Content-Type": "application/json;charset=utf-8",
						},
			});
		} catch (error) {
			this.logger?.log({
				type: "error",
				method: "GET",
				endpoint,
				errorMessage: error instanceof Error ? error.message : String(error),
				durationMs: Date.now() - startedAt,
			});
			throw error;
		}

		if (!res.ok) {
			await this.handleError(res, endpoint).catch(async (err: TMDBError) => {
				if (this.onErrorInterceptor) await this.onErrorInterceptor(err);
				throw err;
			});
		}

		this.logger?.log({
			type: "response",
			method: "GET",
			endpoint,
			status: res.status,
			statusText: res.statusText,
			durationMs: Date.now() - startedAt,
		});

		const data = await res.json();
		const sanitized = this.sanitizeNulls<T>(data);
		if (this.onSuccessInterceptor) {
			const result = await this.onSuccessInterceptor(sanitized as unknown);
			return (result !== undefined ? result : sanitized) as T;
		}
		return sanitized;
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

	private async handleError(res: Response, endpoint: string): Promise<never> {
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
			method: "GET",
			endpoint,
			status: res.status,
			statusText: res.statusText,
			tmdbStatusCode,
			errorMessage,
		});

		const error = new TMDBError(errorMessage, res.status, tmdbStatusCode);
		throw error;
	}
}
