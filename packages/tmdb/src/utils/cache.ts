import type { TMDBLogger } from "./logger";

/**
 * Context passed to a {@link CacheOptions.ttl} function when a response is about to be cached.
 */
export type CacheTTLContext = {
	/** The full cache key (`endpoint?param=value&…`), as `excluded_endpoints` sees it. */
	key: string;
	/** The request endpoint, e.g. `"/movie/550"`. */
	endpoint: string;
	/** The request params the key was built from. */
	params: Record<string, unknown>;
	/** The parsed (null-sanitised) response about to be cached. */
	data: unknown;
};

export type CacheOptions = {
	/**
	 * How long (in milliseconds) each cached entry remains valid.
	 *
	 * - A `number` applies the same TTL to every entry. Must be a finite integer >= 1.
	 * - A function decides the TTL per entry. It runs once, when the response is stored —
	 *   never on reads. Returning `0` or a negative number skips caching that response.
	 *   If it throws or returns a non-finite number, the response is not cached, the
	 *   request still succeeds, and the problem is reported through the `logger` (if any).
	 *
	 * The function never runs for keys matched by `excluded_endpoints`.
	 *
	 * @default 300_000 (5 minutes)
	 *
	 * @example
	 * ```ts
	 * const DAY = 86_400_000;
	 * const tmdb = new TMDB(token, {
	 *   cache: {
	 *     // Movie details live a week, everything else an hour
	 *     ttl: ({ endpoint }) => (/^\/movie\/\d+$/.test(endpoint) ? 7 * DAY : DAY / 24),
	 *   },
	 * });
	 * ```
	 */
	ttl?: number | ((ctx: CacheTTLContext) => number);
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
	 * `RegExp` patterns with the global (`g`) or sticky (`y`) flag are automatically
	 * normalized by stripping those flags. Stateful `lastIndex` mutations would otherwise
	 * cause flaky cache behaviour across repeated calls.
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
	private readonly ttl: number | ((ctx: CacheTTLContext) => number);
	private readonly maxSize: number | undefined;
	private readonly excludedEndpoints: (string | RegExp)[];
	private readonly logger?: TMDBLogger;
	private store: Map<string, CacheEntry> = new Map();

	constructor(options: CacheOptions = {}, logger?: TMDBLogger) {
		const ttl = options.ttl ?? 300_000;
		if (typeof ttl !== "function" && (!Number.isFinite(ttl) || !Number.isInteger(ttl) || ttl < 1)) {
			throw new RangeError(`cache.ttl must be a finite integer >= 1 or a function (got ${String(ttl)})`);
		}
		if (options.max_size !== undefined) {
			if (!Number.isFinite(options.max_size) || !Number.isInteger(options.max_size) || options.max_size < 1) {
				throw new RangeError(`cache.max_size must be a finite integer >= 1 (got ${options.max_size})`);
			}
		}
		this.ttl = ttl;
		this.maxSize = options.max_size;
		this.logger = logger;
		// Strip global/sticky flags from RegExp patterns so repeated .test() calls
		// never mutate lastIndex and produce inconsistent results.
		this.excludedEndpoints = (options.excluded_endpoints ?? []).map((pattern) => {
			if (typeof pattern !== "string" && /[gy]/.test(pattern.flags)) {
				return new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ""));
			}
			return pattern;
		});
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
	 *
	 * Use {@link has} to distinguish a cached `undefined` value from a cache miss.
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
	 * Returns `true` when a non-expired entry exists for `key`.
	 * Expired entries are evicted on access, just like {@link get}.
	 *
	 * Use this as the hit/miss signal when the cached value may itself be `undefined`.
	 */
	has(key: string): boolean {
		const entry = this.store.get(key);
		if (!entry) return false;
		if (Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return false;
		}
		return true;
	}

	/**
	 * Stores `value` under `key` with a fresh TTL.
	 * If `max_size` is set and the store is full, the oldest entry is evicted first.
	 *
	 * When `ttl` is a function it is called here, once, with `request` (defaulting to the
	 * key's path and no params). A non-positive, non-finite, or thrown result skips the
	 * insert; any existing entry for `key` keeps its own expiry.
	 */
	set(key: string, value: unknown, request?: { endpoint: string; params: Record<string, unknown> }): void {
		const ttl = this.resolveTtl(key, value, request);
		if (ttl === undefined) return;
		if (this.maxSize !== undefined && !this.store.has(key) && this.store.size >= this.maxSize) {
			this.store.delete(this.store.keys().next().value as string);
		}
		this.store.set(key, { value, expiresAt: Date.now() + ttl });
	}

	/** Returns the TTL for a new entry, or `undefined` when it should not be cached. */
	private resolveTtl(key: string, data: unknown, request?: { endpoint: string; params: Record<string, unknown> }): number | undefined {
		if (typeof this.ttl === "number") return this.ttl;
		const endpoint = request?.endpoint ?? key.split("?")[0];
		let ttl: unknown;
		try {
			ttl = this.ttl({ key, endpoint, params: request?.params ?? {}, data });
		} catch (error) {
			this.reportTtlError(endpoint, `cache.ttl function threw: ${String(error)}`);
			return undefined;
		}
		if (typeof ttl !== "number" || !Number.isFinite(ttl)) {
			this.reportTtlError(endpoint, `cache.ttl function must return a finite number (got ${String(ttl)})`);
			return undefined;
		}
		return ttl > 0 ? ttl : undefined;
	}

	private reportTtlError(endpoint: string, errorMessage: string): void {
		this.logger?.log({ type: "error", method: "GET", endpoint, errorMessage });
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
