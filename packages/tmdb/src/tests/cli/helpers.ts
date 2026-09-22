/// <reference types="node" />
import { vi } from "vitest";

import type { CliCommand, CliContext, CliIO } from "../../cli/command";

const b64url = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

/** A syntactically valid (unsigned) JWT accepted by `isJwt`. */
export const FAKE_JWT = `${b64url({ alg: "HS256" })}.${b64url({ sub: "cli-test" })}.signature`;

/** A syntactically valid v3 API key (32 hex characters). */
export const FAKE_API_KEY = "0123456789abcdef0123456789abcdef";

export function createIO(stdin = "") {
	const stdout: string[] = [];
	const stderr: string[] = [];
	const io: CliIO = { stdout: (t) => stdout.push(t), stderr: (t) => stderr.push(t), readStdin: async () => stdin };
	return { io, stdout, stderr };
}

export function createCommand(overrides: Partial<CliCommand> = {}): CliCommand {
	return { name: "echo", summary: "Echo positionals", usage: "Usage: tmdb echo <text...>", run: vi.fn(async () => {}), ...overrides };
}

export function createContext(overrides: Partial<CliContext> = {}): CliContext {
	return {
		positionals: [],
		io: createIO().io,
		env: {},
		configPath: "/nonexistent/tmdb/config.json",
		getClient: vi.fn(),
		...overrides,
	};
}
