import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

import { isJwt } from "../utils/jwt";

/** Persisted CLI settings. */
export type CliConfig = {
	/** TMDB credential: an API Read Access Token (JWT) or a v3 API key. */
	token?: string;
};

/** Where a resolved credential came from, in precedence order. */
export type TokenSource = "flag" | "TMDB_BEARER_TOKEN" | "TMDB_API_KEY" | "config";

export type ResolvedToken = { token: string; source: TokenSource };

/** How the SDK will send a credential — mirrors the JWT detection in `ApiClient`. */
export type CredentialKind = "bearer" | "api_key";

/** v3 API keys are 32 hex characters. */
const API_KEY_PATTERN = /^[a-f0-9]{32}$/i;

/** Returns `"bearer"` for JWTs (sent as `Authorization: Bearer`) and `"api_key"` otherwise (sent as `?api_key=`). */
export function credentialKind(token: string): CredentialKind {
	return isJwt(token) ? "bearer" : "api_key";
}

/** `true` for a structurally valid JWT or a 32-character hex v3 API key. Catches typos and truncated pastes. */
export function isValidCredential(token: string): boolean {
	return isJwt(token) || API_KEY_PATTERN.test(token);
}

/**
 * Returns the config file path.
 *
 * - `$TMDB_CONFIG_DIR/config.json` when set (any platform)
 * - Windows: `%APPDATA%/tmdb/config.json`
 * - Elsewhere: `$XDG_CONFIG_HOME/tmdb/config.json`, falling back to `~/.config/tmdb/config.json`
 */
export function configPath(env: NodeJS.ProcessEnv = process.env, platform: NodeJS.Platform = process.platform): string {
	if (env.TMDB_CONFIG_DIR) return join(env.TMDB_CONFIG_DIR, "config.json");
	if (platform === "win32" && env.APPDATA) return join(env.APPDATA, "tmdb", "config.json");
	const base = env.XDG_CONFIG_HOME || join(homedir(), ".config");
	return join(base, "tmdb", "config.json");
}

/** Reads the config file. A missing file yields `{}`; a malformed one throws. */
export async function readConfig(path: string): Promise<CliConfig> {
	let raw: string;
	try {
		raw = await readFile(path, "utf8");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
		throw error;
	}
	try {
		return JSON.parse(raw) as CliConfig;
	} catch {
		throw new Error(`Config file ${path} is not valid JSON. Fix it or run \`tmdb config clear\`.`);
	}
}

/** Writes the config file, readable by the current user only (it holds a secret). */
export async function writeConfig(path: string, config: CliConfig): Promise<void> {
	await mkdir(dirname(path), { recursive: true, mode: 0o700 });
	await writeFile(path, `${JSON.stringify(config, null, "\t")}\n`, { mode: 0o600 });
	// `mode` only applies on creation — tighten an existing file too.
	await chmod(path, 0o600);
}

/** Deletes the config file. No-op when it does not exist. */
export async function clearConfig(path: string): Promise<void> {
	await rm(path, { force: true });
}

/**
 * Resolves the credential by precedence: `--token` flag → `TMDB_BEARER_TOKEN` → `TMDB_API_KEY` → config file.
 * The bearer token wins over the API key because it never appears in request URLs.
 *
 * @returns The credential and its source, or `undefined` when none is configured.
 */
export async function resolveToken(options: { flag?: string; env: NodeJS.ProcessEnv; path: string }): Promise<ResolvedToken | undefined> {
	if (options.flag) return { token: options.flag, source: "flag" };
	if (options.env.TMDB_BEARER_TOKEN) return { token: options.env.TMDB_BEARER_TOKEN, source: "TMDB_BEARER_TOKEN" };
	if (options.env.TMDB_API_KEY) return { token: options.env.TMDB_API_KEY, source: "TMDB_API_KEY" };
	const { token } = await readConfig(options.path);
	return token ? { token, source: "config" } : undefined;
}

/** Masks a token for display, keeping only its first 6 and last 4 characters. */
export function maskToken(token: string): string {
	return token.length <= 12 ? "*".repeat(token.length) : `${token.slice(0, 6)}…${token.slice(-4)}`;
}
