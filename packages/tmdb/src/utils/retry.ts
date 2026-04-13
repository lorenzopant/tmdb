import { TMDBError } from "../errors/tmdb";

export type RetryOptions = {
	/**
	 * Maximum number of retry attempts after the initial request fails.
	 * Set to `0` to disable retries entirely.
	 * @default 3
	 */
	max_retries?: number;
	/**
	 * Base delay in milliseconds used to compute exponential back-off.
	 *
	 * The delay for attempt `n` (1-indexed) is:
	 * ```
	 * clamp(base_delay_ms * 2^(n-1), 0, max_delay_ms) + jitter
	 * ```
	 * where `jitter` is a uniform random value in `[0, base_delay_ms)`.
	 *
	 * @default 500
	 */
	base_delay_ms?: number;
	/**
	 * Maximum delay in milliseconds between retry attempts.
	 * The exponential component is clamped to this value before jitter is added.
	 * @default 30_000
	 */
	max_delay_ms?: number;
	/**
	 * A predicate called before each retry to decide whether the error warrants
	 * another attempt.
	 *
	 * - Return `true` to retry.
	 * - Return `false` to stop retrying and re-throw immediately.
	 * - Async predicates are awaited.
	 *
	 * The default predicate retries on transient server-side errors:
	 * - `TMDBError` with `http_status_code >= 500`
	 * - Any non-`TMDBError` exception (e.g. network / DNS failure)
	 *
	 * 4xx client errors are **never** retried by default.
	 *
	 * @param error - The error thrown by the last attempt.
	 * @param attempt - The 1-indexed attempt number that just failed (1 = first retry after the initial failure).
	 *
	 * @example
	 * ```ts
	 * // Also retry on 429 Too Many Requests
	 * const tmdb = new TMDB(token, {
	 *   retry: {
	 *     shouldRetry: (error) => {
	 *       if (error instanceof TMDBError) return error.http_status_code >= 429;
	 *       return true; // network errors
	 *     },
	 *   },
	 * });
	 * ```
	 */
	shouldRetry?: (error: unknown, attempt: number) => boolean | Promise<boolean>;
};

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 500;
const DEFAULT_MAX_DELAY_MS = 30_000;

function defaultShouldRetry(error: unknown): boolean {
	if (error instanceof TMDBError) {
		return error.http_status_code >= 500;
	}
	// Network / DNS / connection reset errors — always retry
	return true;
}

export class RetryManager {
	private readonly maxRetries: number;
	private readonly baseDelayMs: number;
	private readonly maxDelayMs: number;
	readonly shouldRetry: (error: unknown, attempt: number) => boolean | Promise<boolean>;

	constructor(options: RetryOptions = {}) {
		const maxRetries = options.max_retries ?? DEFAULT_MAX_RETRIES;
		const baseDelayMs = options.base_delay_ms ?? DEFAULT_BASE_DELAY_MS;
		const maxDelayMs = options.max_delay_ms ?? DEFAULT_MAX_DELAY_MS;

		if (!Number.isFinite(maxRetries) || !Number.isInteger(maxRetries) || maxRetries < 0) {
			throw new RangeError(`retry.max_retries must be a finite integer >= 0 (got ${maxRetries})`);
		}
		if (!Number.isFinite(baseDelayMs) || !Number.isInteger(baseDelayMs) || baseDelayMs < 1) {
			throw new RangeError(`retry.base_delay_ms must be a finite integer >= 1 (got ${baseDelayMs})`);
		}
		if (!Number.isFinite(maxDelayMs) || !Number.isInteger(maxDelayMs) || maxDelayMs < 1) {
			throw new RangeError(`retry.max_delay_ms must be a finite integer >= 1 (got ${maxDelayMs})`);
		}

		this.maxRetries = maxRetries;
		this.baseDelayMs = baseDelayMs;
		this.maxDelayMs = maxDelayMs;
		this.shouldRetry = options.shouldRetry ?? defaultShouldRetry;
	}

	/**
	 * Computes the back-off delay for a given retry attempt.
	 *
	 * Uses full jitter: `delay = random(0, min(base * 2^(attempt-1), max))`.
	 * Full jitter spreads load better than deterministic exponential back-off
	 * when many clients retry simultaneously.
	 *
	 * @param attempt - 1-indexed retry attempt number.
	 */
	delayFor(attempt: number): number {
		const exponential = Math.min(this.baseDelayMs * 2 ** (attempt - 1), this.maxDelayMs);
		return Math.floor(Math.random() * exponential);
	}

	/**
	 * Executes `fn`, retrying on retriable errors up to `max_retries` times with
	 * exponential back-off between attempts.
	 *
	 * @param fn - An async factory that performs one request attempt.
	 * @param sleep - Injectable sleep function; defaults to `setTimeout`-based delay.
	 *               Pass a no-op in tests to avoid real waiting.
	 */
	async execute<T>(fn: () => Promise<T>, sleep: (ms: number) => Promise<void> = defaultSleep): Promise<T> {
		let lastError: unknown;

		for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
			try {
				return await fn();
			} catch (error) {
				lastError = error;

				// Don't evaluate shouldRetry or delay after the last allowed attempt
				if (attempt >= this.maxRetries) break;

				const retry = await this.shouldRetry(error, attempt + 1);
				if (!retry) break;

				const delay = this.delayFor(attempt + 1);
				if (delay > 0) await sleep(delay);
			}
		}

		throw lastError;
	}
}

function defaultSleep(ms: number): Promise<void> {
	return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
