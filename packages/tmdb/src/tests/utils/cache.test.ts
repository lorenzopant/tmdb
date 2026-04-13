import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResponseCache } from "../../utils/cache";

describe("ResponseCache", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	// -------------------------------------------------------------------------
	// Constructor validation
	// -------------------------------------------------------------------------

	describe("constructor", () => {
		it("throws RangeError when ttl is less than 1", () => {
			expect(() => new ResponseCache({ ttl: 0 })).toThrow(RangeError);
			expect(() => new ResponseCache({ ttl: 0 })).toThrow("cache.ttl must be a finite integer >= 1");
		});

		it("throws RangeError when ttl is negative", () => {
			expect(() => new ResponseCache({ ttl: -1 })).toThrow(RangeError);
		});

		it("throws RangeError when ttl is a non-integer", () => {
			expect(() => new ResponseCache({ ttl: 1.5 })).toThrow(RangeError);
		});

		it("throws RangeError when ttl is Infinity", () => {
			expect(() => new ResponseCache({ ttl: Infinity })).toThrow(RangeError);
		});

		it("throws RangeError when ttl is NaN", () => {
			expect(() => new ResponseCache({ ttl: NaN })).toThrow(RangeError);
		});

		it("throws RangeError when max_size is less than 1", () => {
			expect(() => new ResponseCache({ max_size: 0 })).toThrow(RangeError);
			expect(() => new ResponseCache({ max_size: 0 })).toThrow("cache.max_size must be a finite integer >= 1");
		});

		it("throws RangeError when max_size is negative", () => {
			expect(() => new ResponseCache({ max_size: -5 })).toThrow(RangeError);
		});

		it("throws RangeError when max_size is a non-integer", () => {
			expect(() => new ResponseCache({ max_size: 2.5 })).toThrow(RangeError);
		});

		it("throws RangeError when max_size is Infinity", () => {
			expect(() => new ResponseCache({ max_size: Infinity })).toThrow(RangeError);
		});

		it("accepts valid ttl and max_size without throwing", () => {
			expect(() => new ResponseCache({ ttl: 1_000, max_size: 100 })).not.toThrow();
		});

		it("uses default TTL of 300_000 ms when no options are provided", () => {
			const cache = new ResponseCache();
			cache.set("k", "v");
			vi.advanceTimersByTime(300_000);
			expect(cache.get("k")).toBe("v");
			vi.advanceTimersByTime(1);
			expect(cache.get("k")).toBeUndefined();
		});
	});

	// -------------------------------------------------------------------------
	// get / set
	// -------------------------------------------------------------------------

	describe("get", () => {
		it("returns undefined for a missing key", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			expect(cache.get("missing")).toBeUndefined();
		});

		it("returns the stored value before the TTL expires", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("k", { id: 1 });
			expect(cache.get("k")).toEqual({ id: 1 });
		});

		it("returns undefined and evicts the entry after the TTL expires", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("k", { id: 1 });
			vi.advanceTimersByTime(1_001);
			expect(cache.get("k")).toBeUndefined();
			// entry is removed from the store
			expect(cache.size).toBe(0);
		});

		it("returns the entry exactly at TTL boundary (not yet expired)", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("k", "value");
			vi.advanceTimersByTime(1_000);
			// expiresAt = now + 1000; after advancing 1000ms, Date.now() === expiresAt
			// condition is  Date.now() > expiresAt  →  false  → still cached
			expect(cache.get("k")).toBe("value");
		});

		it("stores and retrieves non-object primitives", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("num", 42);
			cache.set("str", "hello");
			cache.set("bool", true);
			cache.set("nil", null);
			expect(cache.get("num")).toBe(42);
			expect(cache.get("str")).toBe("hello");
			expect(cache.get("bool")).toBe(true);
			expect(cache.get("nil")).toBeNull();
		});

		it("returns undefined for a key whose stored value is undefined", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("k", undefined);
			// get() returns undefined — use has() to distinguish hit from miss
			expect(cache.get("k")).toBeUndefined();
		});
	});

	// -------------------------------------------------------------------------
	// has
	// -------------------------------------------------------------------------

	describe("has", () => {
		it("returns false for a missing key", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			expect(cache.has("missing")).toBe(false);
		});

		it("returns true for a present, non-expired key", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("k", { id: 1 });
			expect(cache.has("k")).toBe(true);
		});

		it("returns false and evicts the entry after the TTL expires", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("k", { id: 1 });
			vi.advanceTimersByTime(1_001);
			expect(cache.has("k")).toBe(false);
			expect(cache.size).toBe(0);
		});

		it("returns true when the stored value is undefined (distinguishes hit from miss)", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("k", undefined);
			expect(cache.has("k")).toBe(true);
			expect(cache.get("k")).toBeUndefined();
		});

		it("returns true at the TTL boundary (not yet expired)", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("k", "v");
			vi.advanceTimersByTime(1_000);
			expect(cache.has("k")).toBe(true);
		});
	});

	describe("set", () => {
		it("overwrites an existing key and resets its TTL", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("k", "first");
			vi.advanceTimersByTime(900);
			// Overwrite — TTL resets to now + 1000
			cache.set("k", "second");
			vi.advanceTimersByTime(900);
			// 900ms after the overwrite → still valid
			expect(cache.get("k")).toBe("second");
		});

		it("does not evict an existing key that is being updated (counts as existing)", () => {
			const cache = new ResponseCache({ ttl: 1_000, max_size: 1 });
			cache.set("k", "v1");
			expect(cache.size).toBe(1);
			// Updating the same key must not evict it
			cache.set("k", "v2");
			expect(cache.size).toBe(1);
			expect(cache.get("k")).toBe("v2");
		});
	});

	// -------------------------------------------------------------------------
	// max_size eviction
	// -------------------------------------------------------------------------

	describe("max_size eviction", () => {
		it("evicts the oldest entry when the store is full", () => {
			const cache = new ResponseCache({ ttl: 60_000, max_size: 2 });
			cache.set("a", 1);
			cache.set("b", 2);
			// 'a' should be evicted
			cache.set("c", 3);

			expect(cache.get("a")).toBeUndefined();
			expect(cache.get("b")).toBe(2);
			expect(cache.get("c")).toBe(3);
		});

		it("keeps size at or below max_size after repeated insertions", () => {
			const cache = new ResponseCache({ ttl: 60_000, max_size: 3 });
			for (let i = 0; i < 10; i++) {
				cache.set(`k${i}`, i);
			}
			expect(cache.size).toBe(3);
		});

		it("allows unlimited entries when max_size is not set", () => {
			const cache = new ResponseCache({ ttl: 60_000 });
			for (let i = 0; i < 100; i++) {
				cache.set(`k${i}`, i);
			}
			expect(cache.size).toBe(100);
		});
	});

	// -------------------------------------------------------------------------
	// delete
	// -------------------------------------------------------------------------

	describe("delete", () => {
		it("removes an existing entry and returns true", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("k", "v");
			expect(cache.delete("k")).toBe(true);
			expect(cache.get("k")).toBeUndefined();
			expect(cache.size).toBe(0);
		});

		it("returns false when the key does not exist", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			expect(cache.delete("nonexistent")).toBe(false);
		});

		it("does not affect other entries", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.delete("a");
			expect(cache.get("b")).toBe(2);
		});
	});

	// -------------------------------------------------------------------------
	// clear
	// -------------------------------------------------------------------------

	describe("clear", () => {
		it("removes all entries", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			cache.clear();
			expect(cache.size).toBe(0);
			expect(cache.get("a")).toBeUndefined();
			expect(cache.get("b")).toBeUndefined();
		});

		it("is safe to call on an already-empty cache", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			expect(() => cache.clear()).not.toThrow();
			expect(cache.size).toBe(0);
		});
	});

	// -------------------------------------------------------------------------
	// size
	// -------------------------------------------------------------------------

	describe("size", () => {
		it("returns 0 for an empty cache", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			expect(cache.size).toBe(0);
		});

		it("increments as entries are added", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("a", 1);
			expect(cache.size).toBe(1);
			cache.set("b", 2);
			expect(cache.size).toBe(2);
		});

		it("decrements after delete", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			cache.set("a", 1);
			cache.delete("a");
			expect(cache.size).toBe(0);
		});

		it("decrements after lazy TTL eviction via get", () => {
			const cache = new ResponseCache({ ttl: 500 });
			cache.set("a", 1);
			vi.advanceTimersByTime(501);
			cache.get("a"); // triggers eviction
			expect(cache.size).toBe(0);
		});
	});

	// -------------------------------------------------------------------------
	// shouldCache / excluded_endpoints
	// -------------------------------------------------------------------------

	describe("shouldCache", () => {
		it("returns true for all keys when no exclusions are configured", () => {
			const cache = new ResponseCache({ ttl: 1_000 });
			expect(cache.shouldCache("/movie/now_playing")).toBe(true);
			expect(cache.shouldCache("/trending/movie/day")).toBe(true);
		});

		it("returns false when a string pattern matches the start of the key", () => {
			const cache = new ResponseCache({ ttl: 1_000, excluded_endpoints: ["/trending"] });
			expect(cache.shouldCache("/trending/movie/day")).toBe(false);
			expect(cache.shouldCache("/trending/tv/week")).toBe(false);
		});

		it("returns true when a string pattern does not match the start of the key", () => {
			const cache = new ResponseCache({ ttl: 1_000, excluded_endpoints: ["/trending"] });
			expect(cache.shouldCache("/movie/now_playing")).toBe(true);
		});

		it("returns false when a RegExp pattern matches", () => {
			const cache = new ResponseCache({ ttl: 1_000, excluded_endpoints: [/\/discover\//] });
			expect(cache.shouldCache("/discover/movie?sort_by=popularity")).toBe(false);
			expect(cache.shouldCache("/discover/tv?sort_by=vote_average")).toBe(false);
		});

		it("returns true when a RegExp pattern does not match", () => {
			const cache = new ResponseCache({ ttl: 1_000, excluded_endpoints: [/\/discover\//] });
			expect(cache.shouldCache("/movie/popular")).toBe(true);
		});

		it("returns false when any pattern in a mixed list matches", () => {
			const cache = new ResponseCache({
				ttl: 1_000,
				excluded_endpoints: ["/trending", /\/discover\//],
			});
			expect(cache.shouldCache("/trending/movie/day")).toBe(false);
			expect(cache.shouldCache("/discover/movie")).toBe(false);
			expect(cache.shouldCache("/movie/popular")).toBe(true);
		});

		it("does not store entries for excluded keys", () => {
			const cache = new ResponseCache({ ttl: 1_000, excluded_endpoints: ["/trending"] });
			// Calling set directly bypasses shouldCache — only the client honours it;
			// this test verifies shouldCache returns the right answer so client can skip set/get.
			expect(cache.shouldCache("/trending/movie/day")).toBe(false);
			cache.set("/trending/movie/day", { results: [] }); // manual set — client would skip this
			expect(cache.size).toBe(1); // stored, but shouldCache correctly said "no"
		});

		it("normalizes global RegExp flag to prevent lastIndex mutation flakiness", () => {
			// /g flag causes lastIndex to advance on each .test(), making every other call
			// return a different result. The cache must strip the flag so results are stable.
			const globalPattern = /\/discover\//g;
			const cache = new ResponseCache({ ttl: 1_000, excluded_endpoints: [globalPattern] });

			// All calls must consistently return false (excluded) regardless of call count.
			for (let i = 0; i < 6; i++) {
				expect(cache.shouldCache("/discover/movie")).toBe(false);
			}
		});

		it("normalizes sticky RegExp flag for the same reason", () => {
			const stickyPattern = /^\/trending/y;
			const cache = new ResponseCache({ ttl: 1_000, excluded_endpoints: [stickyPattern] });

			for (let i = 0; i < 6; i++) {
				expect(cache.shouldCache("/trending/movie/day")).toBe(false);
			}
		});

		it("does not alter RegExp patterns that have no global or sticky flags", () => {
			const pattern = /\/movie\//i;
			const cache = new ResponseCache({ ttl: 1_000, excluded_endpoints: [pattern] });
			expect(cache.shouldCache("/movie/550")).toBe(false);
			expect(cache.shouldCache("/tv/1396")).toBe(true);
		});
	});
});
