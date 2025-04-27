import { TMDBError } from "./errors/tmdb";

export class ApiClient {
	private accessToken: string;
	private baseUrl: string = "https://api.themoviedb.org/3";

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	async request<T>(endpoint: string, params: Record<string, any | undefined> = {}): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`);
		for (const [key, value] of Object.entries(params)) {
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
				errorMessage = errorBody.status_message || errorMessage;
				tmdbStatusCode = errorBody.status_code;
			}
		} catch (_) {
			// If response is not JSON, fallback to HTTP status text
		}

		throw new TMDBError(errorMessage, res.status, tmdbStatusCode);
	}
}
