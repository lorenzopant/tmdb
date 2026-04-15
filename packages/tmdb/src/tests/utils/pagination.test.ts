import { describe, expect, it, vi } from "vitest";

import type { PaginatedResponse } from "../../types/common/pagination";
import { fetchAllPages, getPageInfo, hasNextPage, hasPreviousPage, paginate } from "../../utils/pagination";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePage<T>(items: T[], page: number, totalPages: number): PaginatedResponse<T> {
	return {
		page,
		total_pages: totalPages,
		total_results: totalPages * items.length,
		results: items,
	};
}

function mockFetcher<T>(pages: T[][]): (page: number) => Promise<PaginatedResponse<T>> {
	return vi.fn(async (page: number) => makePage(pages[page - 1] ?? [], page, pages.length));
}

// ---------------------------------------------------------------------------
// paginate()
// ---------------------------------------------------------------------------

describe("paginate", () => {
	it("yields all pages in order", async () => {
		const fetcher = mockFetcher([
			[1, 2],
			[3, 4],
			[5, 6],
		]);
		const collected: number[][] = [];

		for await (const page of paginate(fetcher)) {
			collected.push(page.results);
		}

		expect(collected).toEqual([
			[1, 2],
			[3, 4],
			[5, 6],
		]);
		expect(fetcher).toHaveBeenCalledTimes(3);
	});

	it("yields a single page when total_pages is 1", async () => {
		const fetcher = mockFetcher([[1, 2, 3]]);
		const collected: number[][] = [];

		for await (const page of paginate(fetcher)) {
			collected.push(page.results);
		}

		expect(collected).toHaveLength(1);
		expect(collected[0]).toEqual([1, 2, 3]);
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it("stops early when caller breaks", async () => {
		const fetcher = mockFetcher([[1], [2], [3], [4], [5]]);

		for await (const page of paginate(fetcher)) {
			if (page.page === 2) break;
		}

		expect(fetcher).toHaveBeenCalledTimes(2);
	});

	it("respects a custom startPage", async () => {
		const fetcher = mockFetcher([[1], [2], [3]]);
		const collected: number[] = [];

		for await (const page of paginate(fetcher, 2)) {
			collected.push(page.page);
		}

		expect(collected).toEqual([2, 3]);
		expect(fetcher).not.toHaveBeenCalledWith(1);
	});

	it("throws RangeError for startPage = 0", async () => {
		const fetcher = mockFetcher([[1]]);
		await expect(async () => {
			for await (const _page of paginate(fetcher, 0)) {
				// should not reach here
			}
		}).rejects.toThrow(RangeError);
	});

	it("throws RangeError for startPage = 501 (exceeds TMDB max)", async () => {
		const fetcher = mockFetcher([[1]]);
		await expect(async () => {
			for await (const _page of paginate(fetcher, 501)) {
				// should not reach here
			}
		}).rejects.toThrow(RangeError);
	});

	it("throws RangeError for non-integer startPage", async () => {
		const fetcher = mockFetcher([[1]]);
		await expect(async () => {
			for await (const _page of paginate(fetcher, 1.5)) {
				// should not reach here
			}
		}).rejects.toThrow(RangeError);
	});

	it("handles empty results gracefully", async () => {
		const fetcher = vi.fn(
			async (_page: number): Promise<PaginatedResponse<number>> => ({
				page: 1,
				total_pages: 1,
				total_results: 0,
				results: [],
			}),
		);
		const collected: number[][] = [];

		for await (const page of paginate(fetcher)) {
			collected.push(page.results);
		}

		expect(collected).toEqual([[]]);
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
});

// ---------------------------------------------------------------------------
// fetchAllPages()
// ---------------------------------------------------------------------------

describe("fetchAllPages", () => {
	it("collects all results into a flat array", async () => {
		const fetcher = mockFetcher([
			[1, 2],
			[3, 4],
			[5, 6],
		]);
		const result = await fetchAllPages(fetcher);

		expect(result).toEqual([1, 2, 3, 4, 5, 6]);
		expect(fetcher).toHaveBeenCalledTimes(3);
	});

	it("returns empty array when results are empty", async () => {
		const fetcher = vi.fn(
			async (_page: number): Promise<PaginatedResponse<number>> => ({
				page: 1,
				total_pages: 1,
				total_results: 0,
				results: [],
			}),
		);
		const result = await fetchAllPages(fetcher);

		expect(result).toEqual([]);
	});

	it("respects maxPages cap", async () => {
		const fetcher = mockFetcher([[1], [2], [3], [4], [5]]);
		const result = await fetchAllPages(fetcher, { maxPages: 3 });

		expect(result).toEqual([1, 2, 3]);
		expect(fetcher).toHaveBeenCalledTimes(3);
	});

	it("stops before cap when total_pages is exhausted", async () => {
		const fetcher = mockFetcher([[1], [2]]);
		const result = await fetchAllPages(fetcher, { maxPages: 10 });

		expect(result).toEqual([1, 2]);
		expect(fetcher).toHaveBeenCalledTimes(2);
	});

	it("defaults to TMDB cap of 500 pages", async () => {
		// Simulate a fetcher that never reports being on the last page
		let callCount = 0;
		const fetcher = vi.fn(async (page: number): Promise<PaginatedResponse<number>> => {
			callCount++;
			return { page, total_pages: 9999, total_results: 9999, results: [page] };
		});

		const result = await fetchAllPages(fetcher);

		expect(callCount).toBe(500);
		expect(result).toHaveLength(500);
	});

	it("deduplicates results by key when deduplicateBy is provided", async () => {
		// Simulate two pages where item name=B appears on both (TMDB popularity-shift duplicate)
		const fetcher = vi.fn(async (page: number): Promise<PaginatedResponse<{ id: number; name: string }>> => {
			const pages = [
				[
					{ id: 1, name: "A" },
					{ id: 2, name: "B" },
				],
				[
					{ id: 2, name: "B" }, // duplicate
					{ id: 3, name: "C" },
				],
			];
			return { page, total_pages: 2, total_results: 4, results: pages[page - 1] };
		});

		const result = await fetchAllPages(fetcher, { deduplicateBy: (item) => item.name });

		expect(result).toHaveLength(3);
		expect(result.map((r) => r.id)).toEqual([1, 2, 3]);
	});

	it("keeps last occurrence when key collides", async () => {
		const fetcher = vi.fn(async (page: number): Promise<PaginatedResponse<{ id: number; page: number }>> => {
			return { page, total_pages: 2, total_results: 2, results: [{ id: 1, page }] };
		});

		const result = await fetchAllPages(fetcher, { deduplicateBy: (item) => item.id });

		expect(result).toHaveLength(1);
		expect(result[0].page).toBe(2); // last occurrence wins
	});

	it("moves duplicate item to its most recently fetched position", async () => {
		const fetcher = vi.fn(async (page: number): Promise<PaginatedResponse<{ id: number; label: string }>> => {
			const pages = [
				[
					{ id: 1, label: "A-1" },
					{ id: 2, label: "B" },
				],
				[
					{ id: 3, label: "C" },
					{ id: 1, label: "A-2" },
				],
			];
			return { page, total_pages: 2, total_results: 4, results: pages[page - 1] };
		});

		const result = await fetchAllPages(fetcher, { deduplicateBy: (item) => item.id });

		expect(result).toEqual([
			{ id: 2, label: "B" },
			{ id: 3, label: "C" },
			{ id: 1, label: "A-2" },
		]);
	});

	it("does not deduplicate when deduplicateBy is not provided", async () => {
		const fetcher = mockFetcher([
			[1, 2],
			[2, 3],
		]);
		const result = await fetchAllPages(fetcher);

		expect(result).toEqual([1, 2, 2, 3]); // raw duplicates preserved
	});
});

// ---------------------------------------------------------------------------
// hasNextPage()
// ---------------------------------------------------------------------------

describe("hasNextPage", () => {
	it("returns true when current page is less than total_pages", () => {
		expect(hasNextPage({ page: 1, total_pages: 3 })).toBe(true);
		expect(hasNextPage({ page: 2, total_pages: 3 })).toBe(true);
	});

	it("returns false when on the last page", () => {
		expect(hasNextPage({ page: 3, total_pages: 3 })).toBe(false);
	});

	it("returns false for a single-page response", () => {
		expect(hasNextPage({ page: 1, total_pages: 1 })).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// hasPreviousPage()
// ---------------------------------------------------------------------------

describe("hasPreviousPage", () => {
	it("returns true when page is greater than 1", () => {
		expect(hasPreviousPage({ page: 2 })).toBe(true);
		expect(hasPreviousPage({ page: 100 })).toBe(true);
	});

	it("returns false on the first page", () => {
		expect(hasPreviousPage({ page: 1 })).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// getPageInfo()
// ---------------------------------------------------------------------------

describe("getPageInfo", () => {
	it("returns correct metadata for a middle page", () => {
		const response = makePage([1, 2], 3, 10);
		expect(getPageInfo(response)).toEqual({
			current: 3,
			total: 10,
			totalResults: 20,
			isFirst: false,
			isLast: false,
		});
	});

	it("sets isFirst = true on page 1", () => {
		const response = makePage([1], 1, 5);
		expect(getPageInfo(response).isFirst).toBe(true);
		expect(getPageInfo(response).isLast).toBe(false);
	});

	it("sets isLast = true on the last page", () => {
		const response = makePage([1], 5, 5);
		expect(getPageInfo(response).isLast).toBe(true);
		expect(getPageInfo(response).isFirst).toBe(false);
	});

	it("sets both isFirst and isLast = true for a single-page response", () => {
		const response = makePage([1, 2, 3], 1, 1);
		const info = getPageInfo(response);
		expect(info.isFirst).toBe(true);
		expect(info.isLast).toBe(true);
		expect(info.totalResults).toBe(3);
	});
});
