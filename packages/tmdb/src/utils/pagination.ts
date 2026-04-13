import type { PaginatedResponse } from "../types/common/pagination";
import { Errors } from "../errors/messages";

/** TMDB caps page numbers at 500 */
const TMDB_MAX_PAGES = 500;

/**
 * Async generator that lazily yields one {@link PaginatedResponse} at a time.
 *
 * Stops automatically when all pages are consumed. The caller can `break` early
 * to avoid unnecessary requests.
 *
 * @param fetcher - A function that accepts a page number and returns a promise
 *   resolving to a {@link PaginatedResponse}.
 * @param startPage - The page to start from (default: `1`).
 *
 * @example
 * ```ts
 * for await (const page of paginate(p => tmdb.search.movies({ query: "batman", page: p }))) {
 *   console.log(page.results);
 * }
 * ```
 */
export async function* paginate<T>(
	fetcher: (page: number) => Promise<PaginatedResponse<T>>,
	startPage = 1,
): AsyncGenerator<PaginatedResponse<T>> {
	if (!Number.isInteger(startPage) || startPage < 1 || startPage > TMDB_MAX_PAGES) {
		throw new RangeError(Errors.INVALID_START_PAGE);
	}
	let page = startPage;
	while (true) {
		const response = await fetcher(page);
		yield response;
		if (response.page >= response.total_pages) break;
		page++;
	}
}

/**
 * Options for {@link fetchAllPages}.
 */
export type FetchAllPagesOptions<T = unknown> = {
	/**
	 * Maximum number of pages to fetch. Defaults to `500` (the TMDB API cap).
	 * Use this as a safety valve to avoid unbounded requests on large result sets.
	 */
	maxPages?: number;
	/**
	 * When provided, results are deduplicated using the returned key.
	 * Useful for endpoints that use popularity-based sorting (e.g. `now_playing`),
	 * where the same item can appear on multiple pages as rankings shift between requests.
	 *
	 * Defaults to `undefined` (no deduplication).
	 *
	 * @example
	 * ```ts
	 * const movies = await fetchAllPages(
	 *   p => tmdb.movie_lists.now_playing({ page: p }),
	 *   { deduplicateBy: m => m.id }
	 * );
	 * ```
	 */
	deduplicateBy?: (item: T) => unknown;
};

/**
 * Fetches all pages sequentially and returns a flat array of results.
 *
 * @param fetcher - A function that accepts a page number and returns a promise
 *   resolving to a {@link PaginatedResponse}.
 * @param options - Optional settings. Use `maxPages` to cap total requests.
 *
 * @example
 * ```ts
 * const movies = await fetchAllPages(
 *   p => tmdb.keywords.movies({ keyword_id: 9715, page: p }),
 *   { maxPages: 5 }
 * );
 * ```
 */
export async function fetchAllPages<T>(
	fetcher: (page: number) => Promise<PaginatedResponse<T>>,
	options: FetchAllPagesOptions<T> = {},
): Promise<T[]> {
	const { maxPages = TMDB_MAX_PAGES, deduplicateBy } = options;
	const results: T[] = [];
	let page = 1;
	while (true) {
		const response = await fetcher(page);
		results.push(...response.results);
		if (response.page >= response.total_pages || page >= maxPages) break;
		page++;
	}
	if (deduplicateBy) {
		return [...new Map(results.map((item) => [deduplicateBy(item), item])).values()];
	}
	return results;
}

/**
 * Returns `true` if there is a next page available.
 *
 * @example
 * ```ts
 * const data = await tmdb.movie_lists.popular({ page: 3 });
 * if (hasNextPage(data)) fetchNextPage();
 * ```
 */
export function hasNextPage(response: Pick<PaginatedResponse<unknown>, "page" | "total_pages">): boolean {
	return response.page < response.total_pages;
}

/**
 * Returns `true` if there is a previous page available.
 *
 * @example
 * ```ts
 * const data = await tmdb.movie_lists.popular({ page: 3 });
 * if (hasPreviousPage(data)) fetchPreviousPage();
 * ```
 */
export function hasPreviousPage(response: Pick<PaginatedResponse<unknown>, "page">): boolean {
	return response.page > 1;
}

/**
 * Structured pagination metadata extracted from a {@link PaginatedResponse}.
 */
export type PageInfo = {
	/** Current page number */
	current: number;
	/** Total number of pages */
	total: number;
	/** Total number of results across all pages */
	totalResults: number;
	/** `true` when on the first page */
	isFirst: boolean;
	/** `true` when on the last page */
	isLast: boolean;
};

/**
 * Extracts structured pagination metadata from a {@link PaginatedResponse}.
 * Useful for driving UI pagination controls.
 *
 * @example
 * ```ts
 * const info = getPageInfo(data);
 * // { current: 3, total: 47, totalResults: 940, isFirst: false, isLast: false }
 * ```
 */
export function getPageInfo(response: PaginatedResponse<unknown>): PageInfo {
	return {
		current: response.page,
		total: response.total_pages,
		totalResults: response.total_results,
		isFirst: response.page === 1,
		isLast: response.page >= response.total_pages,
	};
}
