export type TMDBLoggerEntry = {
	type: "request" | "response" | "error";
	method: "GET" | "POST" | "PUT" | "DELETE";
	endpoint: string;
	status?: number;
	statusText?: string;
	durationMs?: number;
	tmdbStatusCode?: number;
	errorMessage?: string;
};

export type TMDBLoggerFn = (entry: TMDBLoggerEntry) => void;

export class TMDBLogger {
	private logger?: TMDBLoggerFn;

	constructor(logger?: TMDBLoggerFn) {
		this.logger = logger;
	}

	static from(logger?: boolean | TMDBLoggerFn): TMDBLogger | undefined {
		if (!logger) return undefined;
		if (logger === true) return new TMDBLogger(TMDBLogger.defaultLogger);
		// Assume it's a function if it's not a boolean. We could be more strict here, but this is just a utility method, and I want 100% test coverage.
		return new TMDBLogger(logger);
	}

	log(entry: TMDBLoggerEntry): void {
		if (!this.logger) return;
		try {
			this.logger(entry);
		} catch (error) {
			// Avoid breaking requests if the logger throws.
			console.warn(`TMDB logger error: ${error}`);
		}
	}

	private static defaultLogger(entry: TMDBLoggerEntry): void {
		const prefix = "🎬 [tmdb]";
		const timestamp = new Date().toISOString();

		if (entry.type === "request") {
			console.log(`${prefix} ${timestamp} 🛰️ REQUEST ${entry.method} ${entry.endpoint}\n`);
			return;
		}

		if (entry.type === "response") {
			console.log(
				`${prefix} ${timestamp} ✅ RESPONSE ${entry.method} ${entry.status} ${entry.statusText} ${entry.endpoint} (${entry.durationMs}ms)\n`,
			);
			return;
		}

		const statusPart =
			entry.status != null ? `${entry.status} ${entry.statusText}` : "NETWORK ERROR";
		const tmdbPart = entry.tmdbStatusCode != null ? ` (tmdb: ${entry.tmdbStatusCode})` : "";
		console.log(
			`${prefix} ${timestamp} ❌ ${entry.method} ${statusPart} ${entry.endpoint} - ${entry.errorMessage}${tmdbPart}\n`,
		);
	}
}
