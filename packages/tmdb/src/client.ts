import { TMDBAPIErrorResponse, TMDBError } from "./errors/tmdb";
import { TMDBLogger, TMDBLoggerFn } from "./utils/logger";
import { isJwt } from "./utils";

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

	constructor(accessToken: string, options: { logger?: boolean | TMDBLoggerFn; deduplication?: boolean } = {}) {
		this.accessToken = accessToken;
		this.logger = TMDBLogger.from(options.logger);
		this.deduplication = options.deduplication !== false;
	}

	/**
	 * Builds a stable, order-independent cache key for a request.
	 *
	 * `undefined` values are excluded (they are never serialised into the URL),
	 * and the remaining entries are sorted alphabetically before joining so that
	 * `{ language, page }` and `{ page, language }` produce the same key.
	 */
	private buildRequestKey(endpoint: string, params: Record<string, unknown>): string {
		const definedEntries = Object.entries(params)
			.filter(([, v]) => v !== undefined)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([k, v]) => `${k}=${String(v)}`);
		return definedEntries.length > 0 ? `${endpoint}?${definedEntries.join("&")}` : endpoint;
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
	 * The actual fetch + response-parsing pipeline. Called by `request()` only when no
	 * matching in-flight promise exists. Handles URL construction, auth headers, logging,
	 * error mapping, and null sanitisation.
	 */
	private async doRequest<T>(endpoint: string, params: Record<string, unknown | undefined>): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`);
		const jwt = isJwt(this.accessToken);

		for (const [key, value] of Object.entries(params)) {
			if (value === undefined) continue;
			url.searchParams.append(key, String(value));
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

		if (!res.ok) await this.handleError(res, endpoint);

		this.logger?.log({
			type: "response",
			method: "GET",
			endpoint,
			status: res.status,
			statusText: res.statusText,
			durationMs: Date.now() - startedAt,
		});

		const data = await res.json();
		return this.sanitizeNulls<T>(data);
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
