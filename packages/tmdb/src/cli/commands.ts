import type { CliCommand } from "./command";
import { configCommand } from "./commands/config";
import { discoverCommand } from "./commands/discover";
import { movieCommand } from "./commands/movie";
import { personCommand } from "./commands/person";
import { searchCommand } from "./commands/search";
import { trendingCommand } from "./commands/trending";
import { tvCommand } from "./commands/tv";

/** Registry of every available sub-command, in the order shown by `tmdb --help`. */
export const COMMANDS: CliCommand[] = [
	searchCommand,
	movieCommand,
	tvCommand,
	personCommand,
	trendingCommand,
	discoverCommand,
	configCommand,
];
