import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TMDBLogger, type TMDBLoggerEntry } from "../../utils/logger";

const requestEntry: TMDBLoggerEntry = { type: "request", method: "GET", endpoint: "/movie/1" };
const responseEntry: TMDBLoggerEntry = {
	type: "response",
	method: "GET",
	endpoint: "/movie/1",
	status: 200,
	statusText: "OK",
	durationMs: 42,
};
const errorEntryWithStatus: TMDBLoggerEntry = {
	type: "error",
	method: "GET",
	endpoint: "/movie/1",
	status: 404,
	statusText: "Not Found",
	errorMessage: "Not found",
	tmdbStatusCode: 34,
};
const errorEntryNetworkError: TMDBLoggerEntry = {
	type: "error",
	method: "GET",
	endpoint: "/movie/1",
	errorMessage: "Network failure",
};

describe("TMDBLogger.from()", () => {
	it("should return undefined when logger is false", () => {
		expect(TMDBLogger.from(false)).toBeUndefined();
	});

	it("should return undefined when logger is undefined", () => {
		expect(TMDBLogger.from(undefined)).toBeUndefined();
	});

	it("should return a TMDBLogger with defaultLogger when logger is true", () => {
		const instance = TMDBLogger.from(true);
		expect(instance).toBeInstanceOf(TMDBLogger);
	});

	it("should return a TMDBLogger with the provided function when logger is a function", () => {
		const fn = vi.fn();
		const instance = TMDBLogger.from(fn);
		expect(instance).toBeInstanceOf(TMDBLogger);
		instance?.log(requestEntry);
		expect(fn).toHaveBeenCalledOnce();
		expect(fn).toHaveBeenCalledWith(requestEntry);
	});
});

describe("TMDBLogger.log()", () => {
	it("should do nothing when no logger function is set", () => {
		// Constructed without a logger function — log() should be a no-op
		const instance = new TMDBLogger();
		expect(() => instance.log(requestEntry)).not.toThrow();
	});

	it("should call the logger function with the entry", () => {
		const fn = vi.fn();
		const instance = new TMDBLogger(fn);
		instance.log(responseEntry);
		expect(fn).toHaveBeenCalledOnce();
		expect(fn).toHaveBeenCalledWith(responseEntry);
	});

	it("should swallow errors thrown by the logger function and warn", () => {
		const throwing = vi.fn(() => {
			throw new Error("boom");
		});
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const instance = new TMDBLogger(throwing);
		expect(() => instance.log(requestEntry)).not.toThrow();
		expect(warnSpy).toHaveBeenCalledOnce();
		expect(warnSpy.mock.calls[0][0]).toContain("TMDB logger error");
	});
});

describe("TMDBLogger default logger output", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should log a REQUEST entry", () => {
		const instance = TMDBLogger.from(true);
		expect(instance).toBeDefined();
		if (!instance) return;
		instance.log(requestEntry);
		expect(logSpy).toHaveBeenCalledOnce();
		const output: string = logSpy.mock.calls[0][0];
		expect(output).toContain("REQUEST");
		expect(output).toContain("GET");
		expect(output).toContain("/movie/1");
	});

	it("should log a RESPONSE entry", () => {
		const instance = TMDBLogger.from(true);
		expect(instance).toBeDefined();
		if (!instance) return;
		instance.log(responseEntry);
		expect(logSpy).toHaveBeenCalledOnce();
		const output: string = logSpy.mock.calls[0][0];
		expect(output).toContain("RESPONSE");
		expect(output).toContain("200");
		expect(output).toContain("42ms");
	});

	it("should log an ERROR entry with HTTP status", () => {
		const instance = TMDBLogger.from(true);
		expect(instance).toBeDefined();
		if (!instance) return;
		instance.log(errorEntryWithStatus);
		expect(logSpy).toHaveBeenCalledOnce();
		const output: string = logSpy.mock.calls[0][0];
		expect(output).toContain("404");
		expect(output).toContain("Not Found");
		expect(output).toContain("Not found");
		expect(output).toContain("tmdb: 34");
	});

	it("should log an ERROR entry showing NETWORK ERROR when status is absent", () => {
		const instance = TMDBLogger.from(true);
		expect(instance).toBeDefined();
		if (!instance) return;
		instance.log(errorEntryNetworkError);
		expect(logSpy).toHaveBeenCalledOnce();
		const output: string = logSpy.mock.calls[0][0];
		expect(output).toContain("NETWORK ERROR");
		expect(output).toContain("Network failure");
		// no tmdb status code part
		expect(output).not.toContain("tmdb:");
	});
});
