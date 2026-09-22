import type { CliCommand } from "./command";
import { configCommand } from "./commands/config";
import { searchCommand } from "./commands/search";

/** Registry of every available sub-command, in the order shown by `tmdb --help`. */
export const COMMANDS: CliCommand[] = [searchCommand, configCommand];
