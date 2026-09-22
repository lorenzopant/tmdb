import { parseArgs } from "node:util";

import { CliUsageError } from "./command";

export type ParsedCliArgs = {
	/** First positional argument, i.e. the sub-command name. */
	command?: string;
	/** Remaining positional arguments. */
	positionals: string[];
	help: boolean;
	version: boolean;
	/** Access token passed via `--token`. */
	token?: string;
};

const GLOBAL_OPTIONS = {
	help: { type: "boolean", short: "h" },
	version: { type: "boolean", short: "v" },
	token: { type: "string" },
} as const;

/**
 * Parses raw CLI arguments (without the `node` and script path) into a command name, positionals and global flags.
 *
 * @throws {CliUsageError} On unknown or malformed flags.
 */
export function parseCliArgs(argv: string[]): ParsedCliArgs {
	try {
		const { values, positionals } = parseArgs({ args: argv, options: GLOBAL_OPTIONS, allowPositionals: true, strict: true });
		const [command, ...rest] = positionals;
		return { command, positionals: rest, help: values.help ?? false, version: values.version ?? false, token: values.token };
	} catch (error) {
		throw new CliUsageError(error instanceof Error ? error.message : String(error));
	}
}
