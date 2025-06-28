import pino from "pino";

// Create a singleton logger instance for the project
export const logger = pino({
	name: "tmdb-api-ts",
	level: process.env.LOG_LEVEL || "info",
	transport:
		process.env.NODE_ENV === "development"
			? {
					target: "pino-pretty",
					options: { colorize: true },
			  }
			: undefined,
});
