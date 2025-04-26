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

		if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
		return res.json();
	}
}
