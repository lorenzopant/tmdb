import type { CliCommand } from "./command";
import { configCommand } from "./commands/config";

/** Registry of every available sub-command, in the order shown by `tmdb --help`. */
export const COMMANDS: CliCommand[] = [configCommand];
