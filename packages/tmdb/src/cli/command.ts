import type { TMDB } from "../tmdb";
import type { CliFlags, CliOptions } from "./args";
import type { Style } from "./output";

/** Input/output sinks used by the CLI. Injected so commands can be tested without touching the real process streams. */
export type CliIO = {
	stdout: (text: string) => void;
	stderr: (text: string) => void;
	/** Reads all of stdin as text (used for `tmdb config set-token -`). */
	readStdin: () => Promise<string>;
	/** Whether stdout / stderr are interactive terminals (drives color output). */
	stdoutIsTTY: boolean;
	stderrIsTTY: boolean;
	/** Terminal width of stdout, when known. */
	stdoutColumns?: number;
};

/** Context handed to every command's `run()`. */
export type CliContext = {
	/** Positional arguments after the command name. */
	positionals: string[];
	/** All parsed flags, including the command's own {@link CliCommand.options}. */
	flags: CliFlags;
	/** `--json`: print the raw API response instead of formatted output. */
	json: boolean;
	io: CliIO;
	/** Chalk instance for stdout; colors are disabled when piped or when `NO_COLOR` is set. */
	style: Style;
	/** Line width for wrapped text: the terminal width, capped at 100 columns. */
	width: number;
	env: NodeJS.ProcessEnv;
	/** Absolute path of the config file. */
	configPath: string;
	/** Value of the global `--token` flag, if passed. */
	tokenFlag?: string;
	/**
	 * Returns a `TMDB` client built from the resolved token. Lazy so that commands which
	 * don't hit the API (e.g. `config`) never require a token.
	 *
	 * @throws {Error} When no token is configured.
	 */
	getClient: () => Promise<TMDB>;
};

/** A single `tmdb <name>` sub-command. */
export type CliCommand = {
	/** Name typed on the command line, e.g. `"search"`. */
	name: string;
	/** One-line description shown in `tmdb --help`. */
	summary: string;
	/** Usage block shown in `tmdb <name> --help`. */
	usage: string;
	/** Command-specific flags, merged with the global ones. */
	options?: CliOptions;
	run: (ctx: CliContext) => Promise<void>;
};

/** Thrown for invalid invocations (unknown command/flag, missing argument). Mapped to exit code 2. */
export class CliUsageError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "CliUsageError";
	}
}
