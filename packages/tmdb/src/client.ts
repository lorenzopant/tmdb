import { TMDBAPIErrorResponse, TMDBError } from "./errors/tmdb";
import { RequestContext, RequestInterceptor, ResponseContext, ResponseInterceptor, TMDBInterceptors } from "./types/interceptors";
import { TMDBLogger, TMDBLoggerFn } from "./utils/logger";

export class ApiClient {
	private accessToken: string;
	private baseUrl: string = "https://api.themoviedb.org/3";
	private logger?: TMDBLogger;
	private requestInterceptors: RequestInterceptor[] = [];
	private responseInterceptors: ResponseInterceptor[] = [];

	constructor(accessToken: string, options: { logger?: boolean | TMDBLoggerFn; interceptors?: TMDBInterceptors } = {}) {
		this.accessToken = accessToken;
		this.logger = TMDBLogger.from(options.logger);
		if (options.interceptors?.request) {
			this.requestInterceptors = [...options.interceptors.request];
		}
		if (options.interceptors?.response) {
			this.responseInterceptors = [...options.interceptors.response];
		}
	}

	/**
	 * Registers an interceptor. Pass `"request"` to hook before the HTTP request,
	 * or `"response"` to hook after a successful response.
	 * Interceptors run in registration order.
	 */
	use(type: "request", fn: RequestInterceptor): void;
	use(type: "response", fn: ResponseInterceptor): void;
	use(type: "request" | "response", fn: RequestInterceptor | ResponseInterceptor): void {
		if (type === "request") {
			this.requestInterceptors.push(fn as RequestInterceptor);
		} else {
			this.responseInterceptors.push(fn as ResponseInterceptor);
		}
	}

	async request<T>(endpoint: string, params: Record<string, unknown | undefined> = {}): Promise<T> {
		let ctx: RequestContext = {
			endpoint,
			params: { ...params },
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				"Content-Type": "application/json;charset=utf-8",
			},
		};

		for (const interceptor of this.requestInterceptors) {
			ctx = await interceptor(ctx);
		}

		const url = new URL(`${this.baseUrl}${ctx.endpoint}`);
		for (const [key, value] of Object.entries(ctx.params)) {
			if (value === undefined) continue;
			url.searchParams.append(key, String(value));
		}

		const startedAt = Date.now();
		this.logger?.log({
			type: "request",
			method: "GET",
			endpoint: ctx.endpoint,
		});

		let res: Response;
		try {
			res = await fetch(url.toString(), {
				headers: ctx.headers,
			});
		} catch (error) {
			this.logger?.log({
				type: "error",
				method: "GET",
				endpoint: ctx.endpoint,
				errorMessage: error instanceof Error ? error.message : String(error),
				durationMs: Date.now() - startedAt,
			});
			throw error;
		}

		if (!res.ok) await this.handleError(res, ctx.endpoint);

		this.logger?.log({
			type: "response",
			method: "GET",
			endpoint: ctx.endpoint,
			status: res.status,
			statusText: res.statusText,
			durationMs: Date.now() - startedAt,
		});

		const data = await res.json();
		let result = this.sanitizeNulls<T>(data);

		if (this.responseInterceptors.length > 0) {
			const rctx: ResponseContext<T> = { data: result, request: ctx, status: res.status };
			for (const interceptor of this.responseInterceptors) {
				result = await interceptor(rctx);
				rctx.data = result;
			}
		}

		return result;
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
