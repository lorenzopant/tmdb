/** Output sinks used by the CLI. Injected so commands can be tested without touching the real process streams. */
export type CliIO = {
	stdout: (text: string) => void;
	stderr: (text: string) => void;
};

/** Context handed to every command's `run()`. */
export type CliContext = {
	/** Positional arguments after the command name. */
	positionals: string[];
	io: CliIO;
};

/** A single `tmdb <name>` sub-command. */
export type CliCommand = {
	/** Name typed on the command line, e.g. `"search"`. */
	name: string;
	/** One-line description shown in `tmdb --help`. */
	summary: string;
	/** Usage block shown in `tmdb <name> --help`. */
	usage: string;
	run: (ctx: CliContext) => Promise<void>;
};

/** Thrown for invalid invocations (unknown command/flag, missing argument). Mapped to exit code 2. */
export class CliUsageError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "CliUsageError";
	}
}
