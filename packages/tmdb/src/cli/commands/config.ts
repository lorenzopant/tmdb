import { CliUsageError, type CliCommand } from "../command";
import {
	clearConfig,
	credentialKind,
	isValidCredential,
	maskToken,
	readConfig,
	resolveToken,
	writeConfig,
	type CredentialKind,
	type TokenSource,
} from "../config";

const usage = `Usage: tmdb config <subcommand>

Subcommands:
  set-token <token>  Save your TMDB credential (API Read Access Token or v3 API key)
  set-token -        Read the credential from stdin (keeps it out of shell history)
  get                Show the config file path and the active credential (masked)
  clear              Delete the config file

Get a credential at https://www.themoviedb.org/settings/api.
The "API Read Access Token" is recommended: it is sent as a header, never in the URL.

Credential precedence: --token > TMDB_BEARER_TOKEN > TMDB_API_KEY > config file.
Config location: $TMDB_CONFIG_DIR, else $XDG_CONFIG_HOME/tmdb (~/.config/tmdb), or %APPDATA%\\tmdb on Windows.
The config file is plain text, readable only by your user (0600).`;

const KIND_LABEL: Record<CredentialKind, string> = { bearer: "Bearer token", api_key: "v3 API key" };

const SOURCE_LABEL: Record<TokenSource, string> = {
	flag: "--token flag",
	TMDB_BEARER_TOKEN: "TMDB_BEARER_TOKEN",
	TMDB_API_KEY: "TMDB_API_KEY",
	config: "config file",
};

const API_KEY_TIP = "Tip: v3 API keys are sent in request URLs and can end up in proxy logs. Prefer the API Read Access Token.";

/** `tmdb config` — manage the stored credential. */
export const configCommand: CliCommand = {
	name: "config",
	summary: "Manage the stored TMDB credential",
	usage,
	async run({ positionals, io, env, configPath, tokenFlag }) {
		const [subcommand, value] = positionals;

		switch (subcommand) {
			case "set-token": {
				if (!value) throw new CliUsageError("Missing credential. Usage: tmdb config set-token <token|->");
				const token = (value === "-" ? await io.readStdin() : value).trim();
				if (!isValidCredential(token)) {
					throw new CliUsageError(
						"That does not look like a TMDB API Read Access Token (JWT) or a v3 API key (32 hex characters).",
					);
				}
				const kind = credentialKind(token);
				const config = await readConfig(configPath);
				await writeConfig(configPath, { ...config, token });
				io.stdout(`${KIND_LABEL[kind]} saved to ${configPath}`);
				if (kind === "api_key") io.stderr(API_KEY_TIP);
				return;
			}
			case "get": {
				const resolved = await resolveToken({ flag: tokenFlag, env, path: configPath });
				io.stdout(`Config file: ${configPath}`);
				io.stdout(
					resolved
						? `Credential:  ${maskToken(resolved.token)} (${KIND_LABEL[credentialKind(resolved.token)]}, from ${SOURCE_LABEL[resolved.source]})`
						: "Credential:  not set",
				);
				return;
			}
			case "clear": {
				await clearConfig(configPath);
				io.stdout(`Removed ${configPath}`);
				return;
			}
			case undefined:
				throw new CliUsageError("Missing subcommand. Usage: tmdb config <set-token|get|clear>");
			default:
				throw new CliUsageError(`Unknown subcommand "${subcommand}". Usage: tmdb config <set-token|get|clear>`);
		}
	},
};
