/// <reference types="node" />
import { vi } from "vitest";

import type { CliCommand, CliContext, CliIO } from "../../cli/command";
import { createStyle } from "../../cli/output";
import type { TMDB } from "../../tmdb";

const b64url = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

/** A syntactically valid (unsigned) JWT accepted by `isJwt`. */
export const FAKE_JWT = `${b64url({ alg: "HS256" })}.${b64url({ sub: "cli-test" })}.signature`;

/** A syntactically valid v3 API key (32 hex characters). */
export const FAKE_API_KEY = "0123456789abcdef0123456789abcdef";

export function createIO(stdin = "") {
	const stdout: string[] = [];
	const stderr: string[] = [];
	const io: CliIO = {
		stdout: (t) => stdout.push(t),
		stderr: (t) => stderr.push(t),
		readStdin: async () => stdin,
		stdoutIsTTY: false,
		stderrIsTTY: false,
	};
	return { io, stdout, stderr };
}

export function createCommand(overrides: Partial<CliCommand> = {}): CliCommand {
	return { name: "echo", summary: "Echo positionals", usage: "Usage: tmdb echo <text...>", run: vi.fn(async () => {}), ...overrides };
}

export function createContext(overrides: Partial<CliContext> = {}): CliContext {
	return {
		positionals: [],
		flags: {},
		json: false,
		io: createIO().io,
		style: createStyle(false),
		width: 100,
		env: {},
		configPath: "/nonexistent/tmdb/config.json",
		getClient: vi.fn(),
		...overrides,
	};
}

/** Wraps a partial fake client so `ctx.getClient()` resolves to it. */
export function fakeClient(client: Record<string, unknown>): () => Promise<TMDB> {
	return async () => client as unknown as TMDB;
}
