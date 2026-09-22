import { parseCliArgs } from "./args";
import { CliUsageError, type CliCommand, type CliIO } from "./command";
import { COMMANDS } from "./commands";

const defaultIO: CliIO = {
	stdout: (text) => process.stdout.write(`${text}\n`),
	stderr: (text) => process.stderr.write(`${text}\n`),
};

/**
 * Builds the top-level `tmdb --help` text from the command registry.
 */
export function formatHelp(commands: CliCommand[]): string {
	const lines = ["Usage: tmdb <command> [options]", ""];
	if (commands.length > 0) {
		const width = Math.max(...commands.map((c) => c.name.length));
		lines.push("Commands:", ...commands.map((c) => `  ${c.name.padEnd(width)}  ${c.summary}`), "");
	}
	lines.push("Options:", "  -h, --help     Show help", "  -v, --version  Show version", "");
	lines.push("Run `tmdb <command> --help` for command-specific usage.");
	return lines.join("\n");
}

/**
 * CLI entry point. Parses `argv`, dispatches to the matching command, and maps errors to exit codes.
 *
 * @param argv - Arguments without the `node` binary and script path (i.e. `process.argv.slice(2)`).
 * @param io - Output sinks; defaults to the process streams.
 * @param commands - Command registry; overridable for tests.
 * @returns Process exit code: `0` success, `1` runtime error, `2` usage error.
 */
export async function run(argv: string[], io: CliIO = defaultIO, commands: CliCommand[] = COMMANDS): Promise<number> {
	try {
		const args = parseCliArgs(argv);

		if (args.version) {
			io.stdout(__TMDB_VERSION__);
			return 0;
		}

		if (!args.command) {
			io.stdout(formatHelp(commands));
			return 0;
		}

		const command = commands.find((c) => c.name === args.command);
		if (!command) throw new CliUsageError(`Unknown command "${args.command}".`);

		if (args.help) {
			io.stdout(command.usage);
			return 0;
		}

		await command.run({ positionals: args.positionals, io });
		return 0;
	} catch (error) {
		if (error instanceof CliUsageError) {
			io.stderr(`Error: ${error.message}\nRun \`tmdb --help\` for usage.`);
			return 2;
		}
		io.stderr(`Error: ${error instanceof Error ? error.message : String(error)}`);
		return 1;
	}
}
