/// <reference types="node" />
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { parseCliArgs, peekCommand, positiveIntFlag } from "../../cli/args";
import { CliUsageError, type CliContext } from "../../cli/command";
import { formatHelp, run } from "../../cli/run";
import { TMDB } from "../../tmdb";
import pkg from "../../../package.json";
import { createCommand, createIO } from "./helpers";

describe("parseCliArgs()", () => {
	it("splits the command name from the remaining positionals", () => {
		expect(parseCliArgs(["search", "inception", "2010"])).toMatchObject({
			command: "search",
			positionals: ["inception", "2010"],
			help: false,
			version: false,
			json: false,
			token: undefined,
			language: undefined,
		});
	});

	it("parses short and long global flags", () => {
		expect(parseCliArgs(["-h"]).help).toBe(true);
		expect(parseCliArgs(["--version"]).version).toBe(true);
		expect(parseCliArgs(["search", "--token", "abc"]).token).toBe("abc");
		expect(parseCliArgs(["search", "--json", "-l", "it-IT"])).toMatchObject({ json: true, language: "it-IT" });
	});

	it("accepts command-specific options only when provided", () => {
		expect(parseCliArgs(["search", "--type", "movie"], { type: { type: "string" } }).flags.type).toBe("movie");
		expect(() => parseCliArgs(["search", "--type", "movie"])).toThrow(CliUsageError);
	});

	it("throws CliUsageError on unknown flags", () => {
		expect(() => parseCliArgs(["--nope"])).toThrow(CliUsageError);
	});
});

describe("peekCommand()", () => {
	it("finds the command name before flags are validated", () => {
		expect(peekCommand(["--token", "abc", "search", "--type", "movie", "x"])).toBe("search");
		expect(peekCommand(["--json"])).toBeUndefined();
	});
});

describe("positiveIntFlag()", () => {
	it("parses positive integers and rejects everything else", () => {
		expect(positiveIntFlag({ page: "3" }, "page")).toBe(3);
		expect(positiveIntFlag({}, "page")).toBeUndefined();
		for (const bad of ["0", "-1", "1.5", "two"]) expect(() => positiveIntFlag({ page: bad }, "page")).toThrow(CliUsageError);
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
		expect(await run(["echo", "--nope"], { io, commands: [createCommand()] })).toBe(2);
	});

	it("reports an unknown command even when it is followed by unknown flags", async () => {
		const { io, stderr } = createIO();
		expect(await run(["nope", "--whatever"], { io, commands: [] })).toBe(2);
		expect(stderr[0]).toContain('Unknown command "nope"');
	});

	it("passes command-specific flags, --json and a style to the command", async () => {
		const { io } = createIO();
		const command = createCommand({ options: { type: { type: "string" } } });
		expect(await run(["echo", "--type", "movie", "--json"], { io, commands: [command] })).toBe(0);
		expect(command.run).toHaveBeenCalledWith(
			expect.objectContaining({ flags: expect.objectContaining({ type: "movie" }), json: true, style: expect.any(Function) }),
		);
	});

	it("colors the error prefix only when stderr is a TTY", async () => {
		const failing = createCommand({ run: async () => Promise.reject(new Error("boom")) });
		const tty = createIO();
		await run(["echo"], { io: { ...tty.io, stderrIsTTY: true }, commands: [failing], env: {} });
		expect(tty.stderr[0]).toContain("\u001B[");

		const noColor = createIO();
		await run(["echo"], { io: { ...noColor.io, stderrIsTTY: true }, commands: [failing], env: { NO_COLOR: "1" } });
		expect(noColor.stderr).toEqual(["Error: boom"]);
	});

	it("returns 1 when a command throws a runtime error", async () => {
		const { io, stderr } = createIO();
		const command = createCommand({ run: async () => Promise.reject(new Error("boom")) });
		expect(await run(["echo"], { io, commands: [command], env: {} })).toBe(1);
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
