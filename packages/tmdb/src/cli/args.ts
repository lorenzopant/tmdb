import { parseArgs, type ParseArgsConfig } from "node:util";

import { CliUsageError } from "./command";

/** Flag definitions in `node:util` `parseArgs` format. */
export type CliOptions = NonNullable<ParseArgsConfig["options"]>;

/** Parsed flag values, keyed by long flag name. */
export type CliFlags = Record<string, string | boolean | (string | boolean)[] | undefined>;

/** Flags accepted by every command. */
export const GLOBAL_OPTIONS = {
	help: { type: "boolean", short: "h" },
	version: { type: "boolean", short: "v" },
	token: { type: "string" },
	json: { type: "boolean" },
	language: { type: "string", short: "l" },
} as const satisfies CliOptions;

export type ParsedCliArgs = {
	/** First positional argument, i.e. the sub-command name. */
	command?: string;
	/** Remaining positional arguments. */
	positionals: string[];
	help: boolean;
	version: boolean;
	/** Credential passed via `--token`. */
	token?: string;
	/** `--json`: print raw API responses instead of formatted output. */
	json: boolean;
	/** `--language` / `-l`: ISO 639-1 language, optionally with region (e.g. `it-IT`). */
	language?: string;
	/** All parsed flags, including command-specific ones. */
	flags: CliFlags;
};

/**
 * Returns the sub-command name (first positional) without validating flags, so the caller can look up
 * the command's own options before the strict parse.
 */
export function peekCommand(argv: string[]): string | undefined {
	const { tokens } = parseArgs({ args: argv, options: GLOBAL_OPTIONS, allowPositionals: true, strict: false, tokens: true });
	return tokens.find((token) => token.kind === "positional")?.value;
}

/**
 * Parses raw CLI arguments (without the `node` and script path) into a command name, positionals and flags.
 *
 * @param argv - Raw arguments.
 * @param commandOptions - Extra flags accepted by the selected command.
 * @throws {CliUsageError} On unknown or malformed flags.
 */
export function parseCliArgs(argv: string[], commandOptions: CliOptions = {}): ParsedCliArgs {
	try {
		const { values, positionals } = parseArgs({
			args: argv,
			options: { ...GLOBAL_OPTIONS, ...commandOptions },
			allowPositionals: true,
			strict: true,
		});
		const [command, ...rest] = positionals;
		return {
			command,
			positionals: rest,
			help: values.help === true,
			version: values.version === true,
			token: typeof values.token === "string" ? values.token : undefined,
			json: values.json === true,
			language: typeof values.language === "string" ? values.language : undefined,
			flags: values,
		};
	} catch (error) {
		throw new CliUsageError(error instanceof Error ? error.message : String(error));
	}
}

/** Reads a string flag, or `undefined` when absent. */
export function stringFlag(flags: CliFlags, name: string): string | undefined {
	const value = flags[name];
	return typeof value === "string" ? value : undefined;
}

/**
 * Parses a positive integer flag (e.g. `--page 2`).
 *
 * @throws {CliUsageError} When the value is not a positive integer.
 */
export function positiveIntFlag(flags: CliFlags, name: string): number | undefined {
	const value = stringFlag(flags, name);
	if (value === undefined) return undefined;
	if (!/^\d+$/.test(value) || Number(value) < 1) throw new CliUsageError(`--${name} must be a positive integer, got "${value}".`);
	return Number(value);
}
