/// <reference types="node" />
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { parseCliArgs } from "../../cli/args";
import { CliUsageError, type CliContext } from "../../cli/command";
import { formatHelp, run } from "../../cli/run";
import { TMDB } from "../../tmdb";
import pkg from "../../../package.json";
import { createCommand, createIO } from "./helpers";

describe("parseCliArgs()", () => {
	it("splits the command name from the remaining positionals", () => {
		expect(parseCliArgs(["search", "inception", "2010"])).toEqual({
			command: "search",
			positionals: ["inception", "2010"],
			help: false,
			version: false,
			token: undefined,
		});
	});

	it("parses short and long global flags", () => {
		expect(parseCliArgs(["-h"]).help).toBe(true);
		expect(parseCliArgs(["--version"]).version).toBe(true);
		expect(parseCliArgs(["search", "--token", "abc"]).token).toBe("abc");
	});

	it("throws CliUsageError on unknown flags", () => {
		expect(() => parseCliArgs(["--nope"])).toThrow(CliUsageError);
	});
});

describe("run()", () => {
	let dir: string;
	let configPath: string;

	beforeEach(async () => {
		dir = await mkdtemp(join(tmpdir(), "tmdb-cli-"));
		configPath = join(dir, "config.json");
	});

	afterEach(async () => {
		await rm(dir, { recursive: true, force: true });
	});

	it("prints the package version for --version", async () => {
		const { io, stdout } = createIO();
		expect(await run(["--version"], { io, commands: [] })).toBe(0);
		expect(stdout).toEqual([pkg.version]);
	});

	it("prints top-level help when no command is given", async () => {
		const { io, stdout } = createIO();
		const commands = [createCommand()];
		expect(await run([], { io, commands })).toBe(0);
		expect(stdout).toEqual([formatHelp(commands)]);
		expect(stdout[0]).toContain("echo  Echo positionals");
	});

	it("prints command usage for <command> --help without running it", async () => {
		const { io, stdout } = createIO();
		const command = createCommand();
		expect(await run(["echo", "--help"], { io, commands: [command] })).toBe(0);
		expect(stdout).toEqual([command.usage]);
		expect(command.run).not.toHaveBeenCalled();
	});

	it("dispatches to the matching command with its context", async () => {
		const { io } = createIO();
		const command = createCommand();
		const env = { FOO: "bar" };
		expect(await run(["echo", "a", "b", "--token", "t"], { io, commands: [command], env, configPath })).toBe(0);
		expect(command.run).toHaveBeenCalledWith(
			expect.objectContaining({ positionals: ["a", "b"], io, env, configPath, tokenFlag: "t", getClient: expect.any(Function) }),
		);
	});

	it("returns 2 and reports unknown commands on stderr", async () => {
		const { io, stdout, stderr } = createIO();
		expect(await run(["nope"], { io, commands: [] })).toBe(2);
		expect(stdout).toEqual([]);
		expect(stderr[0]).toContain('Unknown command "nope"');
	});

	it("returns 2 for unknown flags", async () => {
		const { io } = createIO();
		expect(await run(["--nope"], { io, commands: [] })).toBe(2);
	});

	it("returns 1 when a command throws a runtime error", async () => {
		const { io, stderr } = createIO();
		const command = createCommand({ run: async () => Promise.reject(new Error("boom")) });
		expect(await run(["echo"], { io, commands: [command] })).toBe(1);
		expect(stderr).toEqual(["Error: boom"]);
	});

	describe("getClient()", () => {
		const captureClient = () => {
			let client: TMDB | undefined;
			const command = createCommand({
				run: async (ctx: CliContext) => {
					client = await ctx.getClient();
				},
			});
			return { command, getClient: () => client };
		};

		it("builds a TMDB client from the resolved token", async () => {
			const { io } = createIO();
			const { command, getClient } = captureClient();
			expect(await run(["echo"], { io, commands: [command], env: { TMDB_BEARER_TOKEN: "env-token" }, configPath })).toBe(0);
			expect(getClient()).toBeInstanceOf(TMDB);
		});

		it("returns 1 with a setup hint when no token is configured", async () => {
			const { io, stderr } = createIO();
			const { command } = captureClient();
			expect(await run(["echo"], { io, commands: [command], env: {}, configPath })).toBe(1);
			expect(stderr[0]).toContain("tmdb config set-token");
		});
	});
});
