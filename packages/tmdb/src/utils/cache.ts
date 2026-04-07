export type CacheOptions = {
	/**
	 * How long (in milliseconds) each cached entry remains valid.
	 * @default 300_000 (5 minutes)
	 */
	ttl?: number;
	/**
	 * Maximum number of entries to hold in memory.
	 * When the store is full the oldest entry is evicted before a new one is inserted.
	 * Defaults to unlimited.
	 */
	max_size?: number;
	/**
	 * Endpoints that should never be cached.
	 *
	 * Each pattern is matched against the full cache key (`endpoint?param=value&…`).
	 * - A `string` is matched with `key.startsWith(pattern)`.
	 * - A `RegExp` is tested with `pattern.test(key)`.
	 *
	 * @example
	 * ```ts
	 * // Never cache trending or any discover endpoint
	 * const tmdb = new TMDB(token, {
	 *   cache: {
	 *     excluded_endpoints: ["/trending", /\/discover\//],
	 *   },
	 * });
	 * ```
	 */
	excluded_endpoints?: (string | RegExp)[];
};

type CacheEntry = {
	value: unknown;
	expiresAt: number;
};

/**
 * A minimal TTL-based in-memory cache for GET request responses.
 *
 * Entries expire lazily — they are evicted on the next access after their TTL
 * has elapsed, rather than on a timer. When `max_size` is set, the oldest
 * entry (by insertion order) is evicted before each new insertion once the
 * store is full.
 */
export class ResponseCache {
	private readonly ttl: number;
	private readonly maxSize: number | undefined;
	private readonly excludedEndpoints: (string | RegExp)[];
	private store: Map<string, CacheEntry> = new Map();

	constructor(options: CacheOptions = {}) {
		const ttl = options.ttl ?? 300_000;
		if (!Number.isFinite(ttl) || !Number.isInteger(ttl) || ttl < 1) {
			throw new RangeError(`cache.ttl must be a finite integer >= 1 (got ${ttl})`);
		}
		if (options.max_size !== undefined) {
			if (!Number.isFinite(options.max_size) || !Number.isInteger(options.max_size) || options.max_size < 1) {
				throw new RangeError(`cache.max_size must be a finite integer >= 1 (got ${options.max_size})`);
			}
		}
		this.ttl = ttl;
		this.maxSize = options.max_size;
		this.excludedEndpoints = options.excluded_endpoints ?? [];
	}

	/**
	 * Returns `true` when the given cache key should be cached.
	 * A key is excluded when it matches any pattern in `excluded_endpoints`.
	 */
	shouldCache(key: string): boolean {
		return !this.excludedEndpoints.some((pattern) => (typeof pattern === "string" ? key.startsWith(pattern) : pattern.test(key)));
	}

	/**
	 * Returns the cached value for `key`, or `undefined` if absent or expired.
	 * Expired entries are evicted on access.
	 */
	get<T>(key: string): T | undefined {
		const entry = this.store.get(key);
		if (!entry) return undefined;
		if (Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return undefined;
		}
		return entry.value as T;
	}

	/**
	 * Stores `value` under `key` with a fresh TTL.
	 * If `max_size` is set and the store is full, the oldest entry is evicted first.
	 */
	set(key: string, value: unknown): void {
		if (this.maxSize !== undefined && !this.store.has(key) && this.store.size >= this.maxSize) {
			this.store.delete(this.store.keys().next().value as string);
		}
		this.store.set(key, { value, expiresAt: Date.now() + this.ttl });
	}

	delete(key: string): boolean {
		return this.store.delete(key);
	}

	clear(): void {
		this.store.clear();
	}

	get size(): number {
		return this.store.size;
	}
}
