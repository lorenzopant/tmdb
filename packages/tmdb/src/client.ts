import { TMDBAPIErrorResponse, TMDBError } from "./errors/tmdb";
import { TMDBLogger, TMDBLoggerFn } from "./utils/logger";

export class ApiClient {
	private accessToken: string;
	private baseUrl: string = "https://api.themoviedb.org/3";
	private logger?: TMDBLogger;

	constructor(accessToken: string, options: { logger?: boolean | TMDBLoggerFn } = {}) {
		this.accessToken = accessToken;
		this.logger = TMDBLogger.from(options.logger);
	}

	async request<T>(endpoint: string, params: Record<string, unknown | undefined> = {}): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`);
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined) continue;
			url.searchParams.append(key, String(value));
		}

		const startedAt = Date.now();
		this.logger?.log({
			type: "request",
			method: "GET",
			endpoint,
		});

		const res = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				"Content-Type": "application/json;charset=utf-8",
			},
		});

		if (!res.ok) await this.handleError(res);

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

		if (value === undefined) {
			return undefined as T;
		}

		if (typeof value !== "object") {
			return value as T;
		}

		if (Array.isArray(value)) {
			return value.map((v) => this.sanitizeNulls<unknown>(v)) as T;
		}

		const sanitized: Record<string, unknown> = {};
		for (const key in value) {
			if (Object.prototype.hasOwnProperty.call(value, key)) {
				sanitized[key] = this.sanitizeNulls<unknown>((value as Record<string, unknown>)[key]);
			}
		}
		return sanitized as T;
	}

	private async handleError(res: Response): Promise<never> {
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
			endpoint: new URL(res.url).pathname.replace(this.baseUrl, ""),
			status: res.status,
			statusText: res.statusText,
			tmdbStatusCode,
			errorMessage,
		});

		const error = new TMDBError(errorMessage, res.status, tmdbStatusCode);
		throw error;
	}
}
