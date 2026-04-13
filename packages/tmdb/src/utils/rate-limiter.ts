export type RateLimitOptions = {
	/**
	 * Maximum number of requests allowed within the window.
	 * @default 40
	 */
	max_requests?: number;
	/**
	 * Window size in milliseconds.
	 * @default 1_000
	 */
	per_ms?: number;
};

/**
 * A sliding-window rate limiter that queues callers when the request budget is exhausted.
 *
 * Callers `await acquire()` before dispatching a fetch. If the number of requests made
 * within the last `per_ms` milliseconds is below `max_requests`, the caller is released
 * immediately. Otherwise it waits until enough time has passed for older timestamps to
 * leave the window, then proceeds.
 *
 * The internal queue is processed serially by a single `process()` loop so there are no
 * race conditions between concurrent callers.
 */
export class RateLimiter {
	private readonly maxRequests: number;
	private readonly windowMs: number;
	private timestamps: number[] = [];
	private queue: Array<() => void> = [];
	private processing = false;

	constructor(options: RateLimitOptions = {}) {
		const maxRequests = options.max_requests ?? 40;
		const perMs = options.per_ms ?? 1_000;

		if (!Number.isFinite(maxRequests) || !Number.isInteger(maxRequests) || maxRequests < 1) {
			throw new RangeError(`rate_limit.max_requests must be a finite integer >= 1 (got ${maxRequests})`);
		}
		if (!Number.isFinite(perMs) || !Number.isInteger(perMs) || perMs < 1) {
			throw new RangeError(`rate_limit.per_ms must be a finite integer >= 1 (got ${perMs})`);
		}

		this.maxRequests = maxRequests;
		this.windowMs = perMs;
	}

	/**
	 * Resolves when a request slot is available within the current window.
	 * Requests that cannot be dispatched immediately are queued in FIFO order.
	 */
	acquire(): Promise<void> {
		return new Promise<void>((resolve) => {
			this.queue.push(resolve);
			if (!this.processing) {
				void this.process();
			}
		});
	}

	private async process(): Promise<void> {
		this.processing = true;
		while (this.queue.length > 0) {
			const now = Date.now();
			// Evict timestamps that have left the sliding window
			this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

			if (this.timestamps.length < this.maxRequests) {
				this.timestamps.push(Date.now());
				const resolve = this.queue.shift()!;
				resolve();
			} else {
				// Wait until the oldest timestamp exits the window
				const oldest = this.timestamps[0];
				const waitMs = this.windowMs - (Date.now() - oldest) + 1;
				await new Promise<void>((r) => setTimeout(r, waitMs));
			}
		}
		this.processing = false;
	}
}
