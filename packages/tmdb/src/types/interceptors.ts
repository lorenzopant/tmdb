/**
 * The mutable context object passed to every request interceptor.
 * Interceptors may modify any field and must return the (modified) context.
 */
export type RequestContext = {
	/** The endpoint path, e.g. "/movie/popular" */
	endpoint: string;
	/** Query-string parameters that will be appended to the URL */
	params: Record<string, unknown>;
	/**
	 * HTTP headers sent with the request (includes `Authorization` and `Content-Type` by default).
	 *
	 * **Browser / CORS warning:** Adding non-standard headers (e.g. `X-*`) triggers a CORS preflight
	 * (`OPTIONS`) request. The TMDB API only allows `Authorization` and `Content-Type` in
	 * `Access-Control-Allow-Headers`, so custom headers will be blocked by the browser.
	 * Header injection is safe **only in server-side environments** (Node.js, edge runtimes, etc.).
	 */
	headers: Record<string, string>;
};

/**
 * A function that runs before every HTTP request.
 * Receives the current {@link RequestContext} and must return the (possibly modified) context.
 * May be async.
 *
 * **Safe in all environments:** modifying `params` or `endpoint`.
 * **Server-side only:** injecting custom headers — browsers will block them via CORS preflight.
 *
 * @example
 * // Add a query param to every request (works everywhere)
 * const addParam: RequestInterceptor = (ctx) => ({
 *   ...ctx,
 *   params: { ...ctx.params, my_param: "value" },
 * });
 *
 * @example
 * // Inject a custom header (server-side only)
 * const addHeader: RequestInterceptor = (ctx) => ({
 *   ...ctx,
 *   headers: { ...ctx.headers, "X-Custom-Header": "value" },
 * });
 */
export type RequestInterceptor = (context: RequestContext) => RequestContext | Promise<RequestContext>;

/**
 * The context object passed to every response interceptor.
 * Contains the sanitized, fully-typed response data and the originating request context.
 */
export type ResponseContext<T = unknown> = {
	/** The sanitized response data (nulls already converted to undefined). */
	data: T;
	/** The originating request context (endpoint, params, headers). */
	request: Readonly<RequestContext>;
	/** The HTTP status code of the response. */
	status: number;
};

/**
 * A function that runs after every successful HTTP response, before the data reaches the caller.
 * Receives a {@link ResponseContext} and must return the (possibly modified) data.
 * May be async.
 *
 * @example
 * // Log every response
 * const logResponse: ResponseInterceptor = (ctx) => {
 *   console.log(`[${ctx.status}] ${ctx.request.endpoint}`, ctx.data);
 *   return ctx.data;
 * };
 *
 * @example
 * // Globally strip a wrapper field (if TMDB ever wraps responses)
 * const unwrap: ResponseInterceptor = (ctx) => (ctx.data as any).results ?? ctx.data;
 */
export type ResponseInterceptor = <T>(context: ResponseContext<T>) => T | Promise<T>;

/**
 * Groups request and response interceptors under a single object.
 * Pass this as `interceptors` in {@link TMDBOptions}.
 *
 * @example
 * new TMDB(token, {
 *   interceptors: {
 *     request: [(ctx) => ({ ...ctx, params: { ...ctx.params, include_adult: false } })],
 *     response: [(ctx) => { console.log(ctx.status); return ctx.data; }],
 *   },
 * });
 */
export type TMDBInterceptors = {
	/** Interceptors that run before every HTTP request, in registration order. */
	request?: RequestInterceptor[];
	/** Interceptors that run after every successful HTTP response, in registration order. */
	response?: ResponseInterceptor[];
};
