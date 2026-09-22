#!/usr/bin/env node
// src/cli/index.ts — `tmdb` bin entry. Kept side-effect only; all logic lives in ./run for testability.
import { run } from "./run";

process.exitCode = await run(process.argv.slice(2));
