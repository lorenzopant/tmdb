import { TMDBAPIErrorResponse, TMDBError } from "./errors/tmdb";

export class ApiClient {
	private accessToken: string;
	private baseUrl: string = "https://api.themoviedb.org/3";

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	async request<T>(endpoint: string, params: Record<string, unknown | undefined> = {}): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`);
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined) continue;
			url.searchParams.append(key, String(value));
		}

		const res = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				"Content-Type": "application/json;charset=utf-8",
			},
		});

		if (!res.ok) await this.handleError(res);
		const data = await res.json();
		return this.sanitizeNulls<T>(data);
	}

	/**
	 * Recursively converts null values to undefined in API responses.
	 * This allows TypeScript optional properties to work as expected.
	 * This will automatically convert null or empty responses from TMDB into undefined values.
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

		const error = new TMDBError(errorMessage, res.status, tmdbStatusCode);
		throw error;
	}
}
