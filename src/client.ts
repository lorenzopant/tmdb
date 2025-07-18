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
		return res.json();
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
