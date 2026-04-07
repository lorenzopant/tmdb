import { TMDBError } from "../../errors/tmdb";
import type { TMDBLoggerFn } from "../../utils/logger";
import type { RateLimitOptions } from "../../utils/rate-limiter";
import { CountryISO3166_1 } from "./countries";
import { ImagesConfig } from "./images";
import { Language } from "./languages";
import { Timezone } from "./timezones";

/**
 * Context object passed to every request interceptor before a TMDB API call is made.
 * Interceptors may return a modified copy of this object to override the endpoint or params,
 * or return `void` / `undefined` to leave the request unchanged.
 */
export type RequestInterceptorContext = {
	/** The API path being requested, e.g. `"/movie/550"`. */
	endpoint: string;
	/** Query parameters that will be appended to the URL. Mutating this object has no effect — return a new context instead. */
	params: Record<string, unknown>;
	/** The HTTP method. */
	method: "GET" | "POST" | "PUT" | "DELETE";
};

/**
 * A function that runs before each TMDB API request.
 *
 * - Return `void` / `undefined` to leave the request unchanged.
 * - Return a (partial) {@link RequestInterceptorContext} to override `endpoint` and/or `params`.
 * - Async interceptors are awaited in order.
 *
 * @example
 * ```ts
 * const tmdb = new TMDB(token, {
 *   interceptors: {
 *     request: (ctx) => {
 *       console.log(`[TMDB] ${ctx.method} ${ctx.endpoint}`, ctx.params);
 *     },
 *   },
 * });
 * ```
 */
export type RequestInterceptor = (
	context: RequestInterceptorContext,
) => RequestInterceptorContext | void | Promise<RequestInterceptorContext | void>;

/**
 * Called after every successful TMDB API response, before data is returned to the caller.
 *
 * - Receives the parsed response as `unknown` (the interceptor is not aware of the specific type).
 * - Return the data (same shape) to pass it through — or return `void` to fall back to the original.
 * - Designed for side effects: logging, caching, image URL enrichment.
 * - Must **not** change the shape of the returned data.
 *
 * @example
 * ```ts
 * const tmdb = new TMDB(token, {
 *   interceptors: {
 *     response: {
 *       onSuccess: (data) => {
 *         myCache.set(data);
 *       },
 *     },
 *   },
 * });
 * ```
 */
export type ResponseSuccessInterceptor = (data: unknown) => unknown | void | Promise<unknown | void>;

/**
 * Called after a TMDB API error has been normalised into a {@link TMDBError}.
 *
 * - Receives a typed `TMDBError` — never raw `unknown`.
 * - Return `void` — this hook is for side effects only (logging, toast notifications, Sentry).
 * - The `TMDBError` is **always re-thrown** after the interceptor runs; you cannot suppress it.
 *
 * @example
 * ```ts
 * const tmdb = new TMDB(token, {
 *   interceptors: {
 *     response: {
 *       onError: (error) => {
 *         Sentry.captureException(error);
 *       },
 *     },
 *   },
 * });
 * ```
 */
export type ResponseErrorInterceptor = (error: TMDBError) => void | Promise<void>;

export type TMDBOptions = {
	/**
	 * The language to use for requests (ISO 639-1 code)
	 * This provides localization and translated data.
	 */
	language?: Language;
	/**
	 * Region codes follow ISO 3166-1 (e.g. 'US', 'IT', 'JP') and are used to localize results.
	 * They affect release dates, age certifications, watch providers, and filtered movie lists.
	 * Example: 'region=IT' returns Italian-specific results for now playing, watch providers, etc.
	 * If not set, TMDB may fall back to a default or global data.
	 */
	region?: CountryISO3166_1;
	/**
	 * Provide images default configuration
	 */
	images?: ImagesConfig;
	/**
	 * Provide a timezone default for all the TV Series related queries
	 * which support the timezone param.
	 * The timezone is used to calculate the “today” for airing TV shows.
	 * Read more: https://www.themoviedb.org/talk/54c554679251416eae010d6d
	 */
	timezone?: Timezone;
	/**
	 * Enable request logging for debugging.
	 * - `true` uses a built-in console logger.
	 * - Pass a function to customize logging output.
	 */
	logger?: boolean | TMDBLoggerFn;
	/**
	 * Controls whether concurrent identical requests are deduplicated.
	 * When `true` (default), multiple in-flight calls with the same endpoint and
	 * parameters share a single fetch and resolve from the same Promise.
	 * Set to `false` to disable deduplication — every call always triggers its
	 * own fetch. Useful for polling loops, force-refreshes after mutations, or
	 * any scenario where stale in-flight data must not be reused.
	 * @default true
	 */
	deduplication?: boolean;
	/**
	 * Interceptors that run at specific points in the request lifecycle.
	 *
	 * `request` interceptors are called **before** every API request, in the order
	 * they are provided. Each interceptor receives a {@link RequestInterceptorContext}
	 * and may optionally return a modified context to change the endpoint or params.
	 *
	 * @example
	 * ```ts
	 * const tmdb = new TMDB(token, {
	 *   interceptors: {
	 *     request: [
	 *       (ctx) => console.log(`→ ${ctx.endpoint}`),
	 *       (ctx) => ({ ...ctx, params: { ...ctx.params, include_adult: false } }),
	 *     ],
	 *   },
	 * });
	 * ```
	 */
	interceptors?: {
		request?: RequestInterceptor | RequestInterceptor[];
		/**
		 * Response lifecycle hooks.
		 *
		 * - `onSuccess` — runs after every successful response, before data is returned.
		 * - `onError` — runs after a {@link TMDBError} is created; always re-throws after.
		 */
		response?: {
			onSuccess?: ResponseSuccessInterceptor;
			onError?: ResponseErrorInterceptor;
		};
	};
	/**
	 * When enabled, outgoing requests are queued to stay within TMDB's API rate limits.
	 *
	 * - `true` — uses the default limits (approximately 40 requests per second).
	 * - Pass a {@link RateLimitOptions} object to customize `max_requests` and/or `per_ms`.
	 *
	 * Requests that exceed the budget are held in a FIFO queue and dispatched as
	 * slots become available. This is especially useful for bulk data-fetching scripts.
	 *
	 * @default false (disabled)
	 *
	 * @example
	 * ```ts
	 * // Enable with defaults (~40 req / s)
	 * const tmdb = new TMDB(token, { rate_limit: true });
	 *
	 * // Custom budget
	 * const tmdb = new TMDB(token, { rate_limit: { max_requests: 30, per_ms: 1_000 } });
	 * ```
	 */
	rate_limit?: boolean | RateLimitOptions;
};
