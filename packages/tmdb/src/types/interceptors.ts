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
