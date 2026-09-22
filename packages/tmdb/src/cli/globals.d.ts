// Ambient declarations for the CLI entry. The SDK itself is runtime-agnostic; only src/cli uses Node APIs.
/// <reference types="node" />

/** Package version, injected at build time by tsdown (`define`) and at test time by vitest. */
declare const __TMDB_VERSION__: string;
