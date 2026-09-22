import { describe, expect, it, vi } from "vitest";

import { parseCliArgs } from "../../cli/args";
import { CliUsageError, type CliCommand, type CliIO } from "../../cli/command";
import { formatHelp, run } from "../../cli/run";
import pkg from "../../../package.json";

function createIO() {
	const stdout: string[] = [];
	const stderr: string[] = [];
	const io: CliIO = { stdout: (t) => stdout.push(t), stderr: (t) => stderr.push(t) };
	return { io, stdout, stderr };
}

function createCommand(overrides: Partial<CliCommand> = {}): CliCommand {
	return { name: "echo", summary: "Echo positionals", usage: "Usage: tmdb echo <text...>", run: vi.fn(async () => {}), ...overrides };
}

describe("parseCliArgs()", () => {
	it("splits the command name from the remaining positionals", () => {
		expect(parseCliArgs(["search", "inception", "2010"])).toEqual({
			command: "search",
			positionals: ["inception", "2010"],
			help: false,
			version: false,
		});
	});

	it("parses short and long global flags", () => {
		expect(parseCliArgs(["-h"]).help).toBe(true);
		expect(parseCliArgs(["--version"]).version).toBe(true);
	});

	it("throws CliUsageError on unknown flags", () => {
		expect(() => parseCliArgs(["--nope"])).toThrow(CliUsageError);
	});
});

describe("run()", () => {
	it("prints the package version for --version", async () => {
		const { io, stdout } = createIO();
		expect(await run(["--version"], io, [])).toBe(0);
		expect(stdout).toEqual([pkg.version]);
	});

	it("prints top-level help when no command is given", async () => {
		const { io, stdout } = createIO();
		const commands = [createCommand()];
		expect(await run([], io, commands)).toBe(0);
		expect(stdout).toEqual([formatHelp(commands)]);
		expect(stdout[0]).toContain("echo  Echo positionals");
	});

	it("prints command usage for <command> --help without running it", async () => {
		const { io, stdout } = createIO();
		const command = createCommand();
		expect(await run(["echo", "--help"], io, [command])).toBe(0);
		expect(stdout).toEqual([command.usage]);
		expect(command.run).not.toHaveBeenCalled();
	});

	it("dispatches to the matching command with its positionals", async () => {
		const { io } = createIO();
		const command = createCommand();
		expect(await run(["echo", "a", "b"], io, [command])).toBe(0);
		expect(command.run).toHaveBeenCalledWith({ positionals: ["a", "b"], io });
	});

	it("returns 2 and reports unknown commands on stderr", async () => {
		const { io, stdout, stderr } = createIO();
		expect(await run(["nope"], io, [])).toBe(2);
		expect(stdout).toEqual([]);
		expect(stderr[0]).toContain('Unknown command "nope"');
	});

	it("returns 2 for unknown flags", async () => {
		const { io } = createIO();
		expect(await run(["--nope"], io, [])).toBe(2);
	});

	it("returns 1 when a command throws a runtime error", async () => {
		const { io, stderr } = createIO();
		const command = createCommand({ run: async () => Promise.reject(new Error("boom")) });
		expect(await run(["echo"], io, [command])).toBe(1);
		expect(stderr).toEqual(["Error: boom"]);
	});
});
