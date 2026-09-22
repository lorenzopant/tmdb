/// <reference types="node" />
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
	clearConfig,
	configPath,
	credentialKind,
	isValidCredential,
	maskToken,
	readConfig,
	resolveToken,
	writeConfig,
} from "../../cli/config";
import { FAKE_API_KEY, FAKE_JWT } from "./helpers";

describe("configPath()", () => {
	it("uses TMDB_CONFIG_DIR over every other location", () => {
		const env = { TMDB_CONFIG_DIR: "/custom", XDG_CONFIG_HOME: "/xdg", APPDATA: "C:\\AppData" };
		expect(configPath(env, "linux")).toBe(join("/custom", "config.json"));
		expect(configPath(env, "win32")).toBe(join("/custom", "config.json"));
	});

	it("uses XDG_CONFIG_HOME when set", () => {
		expect(configPath({ XDG_CONFIG_HOME: "/xdg" }, "linux")).toBe(join("/xdg", "tmdb", "config.json"));
	});

	it("falls back to ~/.config", () => {
		expect(configPath({}, "darwin")).toMatch(/\.config[\\/]tmdb[\\/]config\.json$/);
	});

	it("uses APPDATA on Windows", () => {
		expect(configPath({ APPDATA: "C:\\AppData" }, "win32")).toBe(join("C:\\AppData", "tmdb", "config.json"));
	});
});

describe("config file", () => {
	let dir: string;
	let path: string;

	beforeEach(async () => {
		dir = await mkdtemp(join(tmpdir(), "tmdb-cli-"));
		path = join(dir, "nested", "config.json");
	});

	afterEach(async () => {
		await rm(dir, { recursive: true, force: true });
	});

	it("reads a missing file as an empty config", async () => {
		expect(await readConfig(path)).toEqual({});
	});

	it("round-trips a written config and creates parent directories", async () => {
		await writeConfig(path, { token: "abc" });
		expect(await readConfig(path)).toEqual({ token: "abc" });
	});

	it.skipIf(process.platform === "win32")("writes the file with owner-only permissions", async () => {
		await writeConfig(path, { token: "abc" });
		expect((await stat(path)).mode & 0o777).toBe(0o600);
	});

	it("throws a helpful error on malformed JSON", async () => {
		await writeConfig(path, {});
		await writeFile(path, "{nope");
		await expect(readConfig(path)).rejects.toThrow("tmdb config clear");
	});

	it("clearConfig() removes the file and is idempotent", async () => {
		await writeConfig(path, { token: "abc" });
		await clearConfig(path);
		await clearConfig(path);
		await expect(readFile(path)).rejects.toThrow();
	});

	describe("resolveToken()", () => {
		it("prefers the --token flag", async () => {
			await writeConfig(path, { token: "from-config" });
			expect(await resolveToken({ flag: "from-flag", env: { TMDB_BEARER_TOKEN: "from-env" }, path })).toEqual({
				token: "from-flag",
				source: "flag",
			});
		});

		it("falls back to TMDB_BEARER_TOKEN, preferring it over TMDB_API_KEY", async () => {
			await writeConfig(path, { token: "from-config" });
			expect(await resolveToken({ env: { TMDB_BEARER_TOKEN: "bearer", TMDB_API_KEY: "key" }, path })).toEqual({
				token: "bearer",
				source: "TMDB_BEARER_TOKEN",
			});
		});

		it("falls back to TMDB_API_KEY", async () => {
			await writeConfig(path, { token: "from-config" });
			expect(await resolveToken({ env: { TMDB_API_KEY: "key" }, path })).toEqual({ token: "key", source: "TMDB_API_KEY" });
		});

		it("falls back to the config file", async () => {
			await writeConfig(path, { token: "from-config" });
			expect(await resolveToken({ env: {}, path })).toEqual({ token: "from-config", source: "config" });
		});

		it("returns undefined when nothing is configured", async () => {
			expect(await resolveToken({ env: {}, path })).toBeUndefined();
		});
	});
});

describe("credentialKind()", () => {
	it("classifies JWTs as bearer and everything else as api_key, like ApiClient", () => {
		expect(credentialKind(FAKE_JWT)).toBe("bearer");
		expect(credentialKind(FAKE_API_KEY)).toBe("api_key");
	});
});

describe("isValidCredential()", () => {
	it("accepts JWTs and 32-char hex API keys", () => {
		expect(isValidCredential(FAKE_JWT)).toBe(true);
		expect(isValidCredential(FAKE_API_KEY)).toBe(true);
		expect(isValidCredential(FAKE_API_KEY.toUpperCase())).toBe(true);
	});

	it("rejects truncated keys and arbitrary strings", () => {
		expect(isValidCredential(FAKE_API_KEY.slice(1))).toBe(false);
		expect(isValidCredential("my-token")).toBe(false);
		expect(isValidCredential("")).toBe(false);
	});
});

describe("maskToken()", () => {
	it("keeps only the first 6 and last 4 characters", () => {
		expect(maskToken("abcdef1234567890wxyz")).toBe("abcdef…wxyz");
	});

	it("fully masks short tokens", () => {
		expect(maskToken("short")).toBe("*****");
	});
});
