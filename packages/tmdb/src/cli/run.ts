import { TMDB } from "../tmdb";
import type { Language } from "../types/config/languages";
import { parseCliArgs, peekCommand } from "./args";
import { CliUsageError, type CliCommand, type CliIO } from "./command";
import { COMMANDS } from "./commands";
import { configPath as defaultConfigPath, resolveToken } from "./config";
import { colorEnabled, createStyle, MAX_WIDTH } from "./output";

async function readProcessStdin(): Promise<string> {
	const chunks: Buffer[] = [];
	for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
	return Buffer.concat(chunks).toString("utf8");
}

const defaultIO: CliIO = {
	stdout: (text) => process.stdout.write(`${text}\n`),
	stderr: (text) => process.stderr.write(`${text}\n`),
	readStdin: readProcessStdin,
	stdoutIsTTY: process.stdout.isTTY ?? false,
	stderrIsTTY: process.stderr.isTTY ?? false,
	stdoutColumns: process.stdout.columns,
};

export type RunOptions = {
	io?: CliIO;
	commands?: CliCommand[];
	env?: NodeJS.ProcessEnv;
	/** Overrides the config file location (defaults to {@link defaultConfigPath}). */
	configPath?: string;
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
	lines.push(
		"Options:",
		"  --token <token>      TMDB Bearer token or v3 API key (overrides env and config)",
		"  -l, --language <l>   Response language, e.g. en-US, it-IT",
		"  --json               Print the raw API response as JSON",
		"  -h, --help           Show help",
		"  -v, --version        Show version",
		"",
	);
	lines.push("Run `tmdb <command> --help` for command-specific usage.");
	return lines.join("\n");
}

/**
 * CLI entry point. Parses `argv`, dispatches to the matching command, and maps errors to exit codes.
 *
 * @param argv - Arguments without the `node` binary and script path (i.e. `process.argv.slice(2)`).
 * @param options - Injectable IO, command registry, env and config path; default to the real process.
 * @returns Process exit code: `0` success, `1` runtime error, `2` usage error.
 */
export async function run(argv: string[], options: RunOptions = {}): Promise<number> {
	const { io = defaultIO, commands = COMMANDS, env = process.env } = options;
	const configPath = options.configPath ?? defaultConfigPath(env);
	const errStyle = createStyle(colorEnabled(env, io.stderrIsTTY));

	try {
		const name = peekCommand(argv);
		const command = name === undefined ? undefined : commands.find((c) => c.name === name);
		if (name !== undefined && !command) throw new CliUsageError(`Unknown command "${name}".`);

		const args = parseCliArgs(argv, command?.options);

		if (args.version) {
			io.stdout(__TMDB_VERSION__);
			return 0;
		}

		if (!command) {
			io.stdout(formatHelp(commands));
			return 0;
		}

		if (args.help) {
			io.stdout(command.usage);
			return 0;
		}

		const getClient = async () => {
			const resolved = await resolveToken({ flag: args.token, env, path: configPath });
			if (!resolved) {
				throw new Error(
					"No TMDB credential found. Run `tmdb config set-token <token>`, set TMDB_BEARER_TOKEN (or TMDB_API_KEY), or pass --token.",
				);
			}
			return new TMDB(resolved.token, args.language ? { language: args.language as Language } : {});
		};

		await command.run({
			positionals: args.positionals,
			flags: args.flags,
			json: args.json,
			io,
			style: createStyle(colorEnabled(env, io.stdoutIsTTY)),
			width: Math.min(io.stdoutColumns || MAX_WIDTH, MAX_WIDTH),
			env,
			configPath,
			tokenFlag: args.token,
			getClient,
		});
		return 0;
	} catch (error) {
		const prefix = errStyle.red.bold("Error:");
		if (error instanceof CliUsageError) {
			io.stderr(`${prefix} ${error.message}\n${errStyle.dim("Run `tmdb --help` for usage.")}`);
			return 2;
		}
		io.stderr(`${prefix} ${error instanceof Error ? error.message : String(error)}`);
		return 1;
	}
}
