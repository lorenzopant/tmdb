/// <reference types="node" />
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CliUsageError } from "../../../cli/command";
import { configCommand } from "../../../cli/commands/config";
import { readConfig, writeConfig } from "../../../cli/config";
import { createContext, createIO, FAKE_API_KEY, FAKE_JWT } from "../helpers";

describe("tmdb config", () => {
	let dir: string;
	let configPath: string;

	beforeEach(async () => {
		dir = await mkdtemp(join(tmpdir(), "tmdb-cli-"));
		configPath = join(dir, "config.json");
	});

	afterEach(async () => {
		await rm(dir, { recursive: true, force: true });
	});

	describe("set-token", () => {
		it("saves a bearer token passed as an argument", async () => {
			const { io, stdout, stderr } = createIO();
			await configCommand.run(createContext({ positionals: ["set-token", FAKE_JWT], io, configPath }));
			expect(await readConfig(configPath)).toEqual({ token: FAKE_JWT });
			expect(stdout).toEqual([`Bearer token saved to ${configPath}`]);
			expect(stderr).toEqual([]);
		});

		it("saves a v3 API key and suggests the bearer token on stderr", async () => {
			const { io, stdout, stderr } = createIO();
			await configCommand.run(createContext({ positionals: ["set-token", FAKE_API_KEY], io, configPath }));
			expect(await readConfig(configPath)).toEqual({ token: FAKE_API_KEY });
			expect(stdout).toEqual([`v3 API key saved to ${configPath}`]);
			expect(stderr[0]).toContain("Prefer the API Read Access Token");
		});

		it("reads the token from stdin when given '-'", async () => {
			const { io } = createIO(`${FAKE_JWT}\n`);
			await configCommand.run(createContext({ positionals: ["set-token", "-"], io, configPath }));
			expect(await readConfig(configPath)).toEqual({ token: FAKE_JWT });
		});

		it("rejects values that are neither JWTs nor API keys", async () => {
			await expect(configCommand.run(createContext({ positionals: ["set-token", "not-a-credential"], configPath }))).rejects.toThrow(
				CliUsageError,
			);
			expect(await readConfig(configPath)).toEqual({});
		});

		it("requires a token argument", async () => {
			await expect(configCommand.run(createContext({ positionals: ["set-token"], configPath }))).rejects.toThrow(CliUsageError);
		});
	});

	describe("get", () => {
		it("shows the path and the masked token with its source", async () => {
			await writeConfig(configPath, { token: FAKE_JWT });
			const { io, stdout } = createIO();
			await configCommand.run(createContext({ positionals: ["get"], io, configPath }));
			expect(stdout[0]).toBe(`Config file: ${configPath}`);
			expect(stdout[1]).toContain("(Bearer token, from config file)");
			expect(stdout[1]).not.toContain(FAKE_JWT);
		});

		it("reports the env var as source when set", async () => {
			const { io, stdout } = createIO();
			await configCommand.run(createContext({ positionals: ["get"], io, configPath, env: { TMDB_BEARER_TOKEN: FAKE_JWT } }));
			expect(stdout[1]).toContain("(Bearer token, from TMDB_BEARER_TOKEN)");
		});

		it("labels a v3 API key from TMDB_API_KEY", async () => {
			const { io, stdout } = createIO();
			await configCommand.run(createContext({ positionals: ["get"], io, configPath, env: { TMDB_API_KEY: FAKE_API_KEY } }));
			expect(stdout[1]).toContain("(v3 API key, from TMDB_API_KEY)");
		});

		it("reports a missing token", async () => {
			const { io, stdout } = createIO();
			await configCommand.run(createContext({ positionals: ["get"], io, configPath }));
			expect(stdout[1]).toContain("not set");
		});
	});

	describe("clear", () => {
		it("removes the config file", async () => {
			await writeConfig(configPath, { token: FAKE_JWT });
			await configCommand.run(createContext({ positionals: ["clear"], configPath }));
			expect(await readConfig(configPath)).toEqual({});
		});
	});

	it("throws CliUsageError on missing or unknown subcommands", async () => {
		await expect(configCommand.run(createContext({ positionals: [] }))).rejects.toThrow(CliUsageError);
		await expect(configCommand.run(createContext({ positionals: ["nope"] }))).rejects.toThrow(CliUsageError);
	});
});
