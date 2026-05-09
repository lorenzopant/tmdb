import { describe, expect, test } from "vitest";
import { ImageAPI } from "../../images/images";
import { IMAGE_BASE_URL, IMAGE_SECURE_BASE_URL } from "../../types";

describe("ImageAPI", () => {
	const path = "/sample.jpg";

	test("should generate secure poster URL by default", () => {
		const imageAPI = new ImageAPI();
		const poster_path = "/1E5baAaEse26fej7uHcjOgEE2t2.jpg"; // Fast X
		const url = imageAPI.poster(poster_path);
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w500${poster_path}`);
	});

	test("should generate non-secure poster URL when configured", () => {
		const poster_path = "/1E5baAaEse26fej7uHcjOgEE2t2.jpg"; // Fast X
		const imageAPI = new ImageAPI({ secure_images_url: false });
		const url = imageAPI.poster(poster_path);
		expect(url).toBe(`${IMAGE_BASE_URL}w500${poster_path}`);
	});

	test("should use default image sizes if defined", () => {
		const imageAPI = new ImageAPI({ default_image_sizes: { posters: "original" } });
		const url = imageAPI.poster(path);
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}original${path}`);
	});

	test("should generate backdrop URL", () => {
		const imageAPI = new ImageAPI();
		const url = imageAPI.backdrop(path, "w1280");
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w1280${path}`);
	});

	test("should use default backdrop size w780 when no size provided", () => {
		const imageAPI = new ImageAPI();
		const url = imageAPI.backdrop(path);
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w780${path}`);
	});

	test("should use default_image_sizes.backdrops when no size provided", () => {
		const imageAPI = new ImageAPI({ default_image_sizes: { backdrops: "w1280" } });
		const url = imageAPI.backdrop(path);
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w1280${path}`);
	});

	test("should generate logo URL", () => {
		const imageAPI = new ImageAPI();
		const url = imageAPI.logo(path, "w300");
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w300${path}`);
	});

	test("should use default logo size w185 when no size provided", () => {
		const imageAPI = new ImageAPI();
		const url = imageAPI.logo(path);
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w185${path}`);
	});

	test("should use default_image_sizes.logos when no size provided", () => {
		const imageAPI = new ImageAPI({ default_image_sizes: { logos: "w500" } });
		const url = imageAPI.logo(path);
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w500${path}`);
	});

	test("should generate profile URL", () => {
		const imageAPI = new ImageAPI();
		const url = imageAPI.profile(path, "h632");
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}h632${path}`);
	});

	test("should use default profile size w185 when no size provided", () => {
		const imageAPI = new ImageAPI();
		const url = imageAPI.profile(path);
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w185${path}`);
	});

	test("should use default_image_sizes.profiles when no size provided", () => {
		const imageAPI = new ImageAPI({ default_image_sizes: { profiles: "h632" } });
		const url = imageAPI.profile(path);
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}h632${path}`);
	});

	test("should generate still URL", () => {
		const imageAPI = new ImageAPI();
		const url = imageAPI.still(path, "w300");
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w300${path}`);
	});

	test("should use default still size w300 when no size provided", () => {
		const imageAPI = new ImageAPI();
		const url = imageAPI.still(path);
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w300${path}`);
	});

	test("should use default_image_sizes.still when no size provided", () => {
		const imageAPI = new ImageAPI({ default_image_sizes: { still: "w185" } });
		const url = imageAPI.still(path);
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w185${path}`);
	});

	test("should autocomplete known image path fields recursively", () => {
		const imageAPI = new ImageAPI({
			default_image_sizes: {
				backdrops: "w1280",
				posters: "original",
				profiles: "h632",
			},
		});

		const result = imageAPI.autocompleteImagePaths({
			poster_path: "/poster.jpg",
			nested: {
				backdrop_path: "/backdrop.jpg",
				credits: [{ profile_path: "/profile.jpg" }],
			},
		});

		expect(result).toEqual({
			poster_path: `${IMAGE_SECURE_BASE_URL}original/poster.jpg`,
			nested: {
				backdrop_path: `${IMAGE_SECURE_BASE_URL}w1280/backdrop.jpg`,
				credits: [{ profile_path: `${IMAGE_SECURE_BASE_URL}h632/profile.jpg` }],
			},
		});
	});

	test("should autocomplete file_path only inside known image collections", () => {
		const imageAPI = new ImageAPI({
			secure_images_url: false,
			default_image_sizes: {
				logos: "w500",
				posters: "w342",
			},
		});

		const result = imageAPI.autocompleteImagePaths({
			posters: [{ file_path: "/poster.jpg" }],
			logos: [{ file_path: "/logo.svg" }],
			metadata: { file_path: "/leave-alone.jpg" },
		});

		expect(result).toEqual({
			posters: [{ file_path: `${IMAGE_BASE_URL}w342/poster.jpg` }],
			logos: [{ file_path: `${IMAGE_BASE_URL}w500/logo.svg` }],
			metadata: { file_path: "/leave-alone.jpg" },
		});
	});

	test("should leave absolute urls and non-image values untouched", () => {
		const imageAPI = new ImageAPI();

		expect(
			imageAPI.autocompleteImagePaths({
				poster_path: "https://cdn.example.com/poster.jpg",
				backdrop_path: "/backdrop.jpg",
				title: "Fight Club",
				rating: 8.8,
			}),
		).toEqual({
			poster_path: "https://cdn.example.com/poster.jpg",
			backdrop_path: `${IMAGE_SECURE_BASE_URL}w780/backdrop.jpg`,
			title: "Fight Club",
			rating: 8.8,
		});
	});

	test("should return primitives and arrays without record wrappers", () => {
		const imageAPI = new ImageAPI();

		expect(imageAPI.autocompleteImagePaths(null)).toBeNull();
		expect(imageAPI.autocompleteImagePaths("plain-string")).toBe("plain-string");
		expect(imageAPI.autocompleteImagePaths(["plain-string", "/poster.jpg"])).toEqual([
			"plain-string",
			"/poster.jpg",
		]);
	});

	test("should guard against prototype pollution via __proto__", () => {
		const imageAPI = new ImageAPI();

		// Create object with __proto__ as an own property (as it would come from JSON)
		const response = Object.create(null);
		response.poster_path = "/poster.jpg";
		response.__proto__ = { evil: true };

		const result = imageAPI.autocompleteImagePaths(response);

		// Verify the transformation works even with dangerous keys present
		// The main goal is to ensure autocompleteImagePaths doesn't crash or pollute the prototype
		expect(result.poster_path).toBe(`${IMAGE_SECURE_BASE_URL}w500/poster.jpg`);
		// Ensure the result is safe (proto is not inherited)
		expect(Object.prototype.hasOwnProperty.call(result, "evil")).toBe(false);
	});

	test("should guard against prototype pollution via constructor", () => {
		const imageAPI = new ImageAPI();

		const response = Object.create(null);
		response.poster_path = "/poster.jpg";
		response.constructor = { malicious: "payload" };

		const result = imageAPI.autocompleteImagePaths(response);

		// Verify the transformation works and doesn't break due to constructor key
		expect(result.poster_path).toBe(`${IMAGE_SECURE_BASE_URL}w500/poster.jpg`);
	});

	test("should ignore prototype chain properties when checking image collections", () => {
		const imageAPI = new ImageAPI();

		// A key that exists on Object.prototype like toString should not be treated as an image collection
		const response = {
			poster_path: "/poster.jpg",
			toString: [{ file_path: "/should-not-expand.jpg" }],
		};

		const result = imageAPI.autocompleteImagePaths(response);

		// _toString_ should be preserved as-is (not treated as an image collection)
		expect(result).toEqual({
			poster_path: `${IMAGE_SECURE_BASE_URL}w500/poster.jpg`,
			toString: [{ file_path: "/should-not-expand.jpg" }],
		});
	});

	test("should safely handle responses with prototype-like keys", () => {
		const imageAPI = new ImageAPI();

		const response = {
			poster_path: "/poster.jpg",
			hasOwnProperty: "value",
			valueOf: { poster_path: "/nested.jpg" },
		};

		const result = imageAPI.autocompleteImagePaths(response);

		expect(result).toEqual({
			poster_path: `${IMAGE_SECURE_BASE_URL}w500/poster.jpg`,
			hasOwnProperty: "value",
			valueOf: { poster_path: `${IMAGE_SECURE_BASE_URL}w500/nested.jpg` },
		});
	});

	describe("image_language_priority", () => {
		const makePosters = () => [
			{ file_path: "/en.jpg", iso_639_1: "en" },
			{ file_path: "/fr.jpg", iso_639_1: "fr" },
			{ file_path: "/null.jpg", iso_639_1: undefined },
			{ file_path: "/de.jpg", iso_639_1: "de" },
		];

		test("should reorder posters: textless first, then en, then rest", () => {
			const imageAPI = new ImageAPI({
				image_language_priority: { posters: ["null", "en", "*"] },
			});

			const input = { posters: makePosters() };
			const result = imageAPI.autocompleteImagePaths(input);

			expect(result.posters.map((p) => p.iso_639_1)).toEqual([undefined, "en", "fr", "de"]);
		});

		test("should reorder posters: en first, textless second, wildcard rest", () => {
			const imageAPI = new ImageAPI({
				image_language_priority: { posters: ["en", "null", "*"] },
			});

			const input = { posters: makePosters() };
			const result = imageAPI.autocompleteImagePaths(input);

			expect(result.posters.map((p) => p.iso_639_1)).toEqual(["en", undefined, "fr", "de"]);
		});

		test("should not drop items that have no matching priority entry", () => {
			const imageAPI = new ImageAPI({
				image_language_priority: { posters: ["en"] },
			});

			const input = { posters: makePosters() };
			const result = imageAPI.autocompleteImagePaths(input);

			// en first, then remaining in original order
			expect(result.posters).toHaveLength(4);
			expect(result.posters[0]?.iso_639_1).toBe("en");
		});

		test("wildcard * consumes all remaining items", () => {
			const imageAPI = new ImageAPI({
				image_language_priority: { posters: ["null", "*"] },
			});

			const input = { posters: makePosters() };
			const result = imageAPI.autocompleteImagePaths(input);

			expect(result.posters).toHaveLength(4);
			expect(result.posters[0]?.iso_639_1).toBeUndefined();
		});

		test("should apply priority only to the configured collection, leave others unchanged", () => {
			const imageAPI = new ImageAPI({
				image_language_priority: { posters: ["null"] },
			});

			const original = [
				{ file_path: "/a.jpg", iso_639_1: "en" },
				{ file_path: "/b.jpg", iso_639_1: undefined },
			];

			const input = {
				posters: [...original],
				backdrops: [...original],
			};

			const result = imageAPI.autocompleteImagePaths(input);

			// posters: reordered (null first)
			expect(result.posters[0]?.iso_639_1).toBeUndefined();
			// backdrops: unchanged order (en first, as in original)
			expect(result.backdrops[0]?.iso_639_1).toBe("en");
		});

		test("should also autocomplete file_path inside priority-sorted items", () => {
			const imageAPI = new ImageAPI({
				default_image_sizes: { posters: "w342" },
				image_language_priority: { posters: ["null", "en", "*"] },
			});

			const input = {
				posters: [
					{ file_path: "/en.jpg", iso_639_1: "en" },
					{ file_path: "/null.jpg", iso_639_1: undefined },
				],
			};

			const result = imageAPI.autocompleteImagePaths(input);

			expect(result.posters[0]?.file_path).toBe(`${IMAGE_SECURE_BASE_URL}w342/null.jpg`);
			expect(result.posters[1]?.file_path).toBe(`${IMAGE_SECURE_BASE_URL}w342/en.jpg`);
		});

		test("should treat iso_639_1 null (pre-sanitize) same as undefined for 'null' priority", () => {
			const imageAPI = new ImageAPI({
				image_language_priority: { posters: ["null", "*"] },
			});

			const input = {
				posters: [
					{ file_path: "/en.jpg", iso_639_1: "en" },
					{ file_path: "/null.jpg", iso_639_1: null },
				],
			} as unknown as { posters: { file_path: string; iso_639_1: string | undefined }[] };

			const result = imageAPI.autocompleteImagePaths(input);

			expect(result.posters[0]?.iso_639_1).toBeNull();
			expect(result.posters[1]?.iso_639_1).toBe("en");
		});
	});

	test("should preserve Date and class instances without rebuilding them", () => {
		const imageAPI = new ImageAPI();

		class MediaWrapper {
			constructor(public poster_path: string) {}
		}

		const date = new Date("2024-01-01T00:00:00.000Z");
		const instance = new MediaWrapper("/poster.jpg");

		expect(imageAPI.autocompleteImagePaths(date)).toBe(date);
		expect(imageAPI.autocompleteImagePaths(instance)).toBe(instance);
		expect(instance.poster_path).toBe("/poster.jpg");
	});

	describe("fallback_url", () => {
		test("single string fallback replaces null/undefined image path fields", () => {
			const imageAPI = new ImageAPI({ fallback_url: "/placeholder.png" });

			const result = imageAPI.autocompleteImagePaths({
				poster_path: null,
				backdrop_path: undefined,
				title: "Movie",
			});

			expect(result.poster_path).toBe("/placeholder.png");
			expect(result.backdrop_path).toBe("/placeholder.png");
			expect(result.title).toBe("Movie");
		});

		test("per-type object fallback applies only to configured types", () => {
			const imageAPI = new ImageAPI({
				fallback_url: { posters: "/poster-ph.png", backdrops: "/backdrop-ph.png" },
			});

			const result = imageAPI.autocompleteImagePaths({
				poster_path: null,
				backdrop_path: null,
				logo_path: null,
			});

			expect(result.poster_path).toBe("/poster-ph.png");
			expect(result.backdrop_path).toBe("/backdrop-ph.png");
			// logo has no fallback configured — stays null
			expect(result.logo_path).toBeNull();
		});

		test("fallback does not affect existing (non-null) paths in autocompleteImagePaths", () => {
			const imageAPI = new ImageAPI({ fallback_url: "/placeholder.png" });

			const result = imageAPI.autocompleteImagePaths({
				poster_path: "/real-poster.jpg",
				backdrop_path: null,
			});

			// autocompleteImagePaths always expands existing paths (that's its purpose)
			expect(result.poster_path).toBe(`${IMAGE_SECURE_BASE_URL}w500/real-poster.jpg`);
			expect(result.backdrop_path).toBe("/placeholder.png");
		});

		test("applyFallbacksOnly: replaces null paths without expanding existing ones", () => {
			const imageAPI = new ImageAPI({ fallback_url: "/placeholder.png" });

			const result = imageAPI.applyFallbacksOnly({
				poster_path: "/real-poster.jpg",
				backdrop_path: null,
			});

			// applyFallbacksOnly does NOT expand existing relative paths
			expect(result.poster_path).toBe("/real-poster.jpg");
			expect(result.backdrop_path).toBe("/placeholder.png");
		});

		test("applyFallbacksOnly: does NOT reorder collections even when image_language_priority is set", () => {
			const imageAPI = new ImageAPI({
				fallback_url: "/placeholder.png",
				image_language_priority: { posters: ["null", "en", "*"] },
			});

			const posters = [
				{ file_path: "/en.jpg", iso_639_1: "en" },
				{ file_path: "/fr.jpg", iso_639_1: "fr" },
				{ file_path: null, iso_639_1: null },
			];

			const result = imageAPI.applyFallbacksOnly({ posters });

			// Order must be unchanged
			expect(result.posters[0]?.iso_639_1).toBe("en");
			expect(result.posters[1]?.iso_639_1).toBe("fr");
			expect(result.posters[2]?.iso_639_1).toBeNull();
			// But null file_path should still get the fallback
			expect(result.posters[2]?.file_path).toBe("/placeholder.png");
		});

		test("fallback + autocomplete_paths expands existing paths AND substitutes null", () => {
			const imageAPI = new ImageAPI({
				autocomplete_paths: true,
				fallback_url: "/placeholder.png",
				default_image_sizes: { posters: "w500" },
			});

			const result = imageAPI.autocompleteImagePaths({
				poster_path: "/real-poster.jpg",
				backdrop_path: null,
			});

			expect(result.poster_path).toBe(`${IMAGE_SECURE_BASE_URL}w500/real-poster.jpg`);
			expect(result.backdrop_path).toBe("/placeholder.png");
		});

		test("null file_path inside a collection uses fallback for that collection type", () => {
			const imageAPI = new ImageAPI({
				fallback_url: { posters: "/poster-ph.png", logos: "/logo-ph.png" },
			});

			const result = imageAPI.autocompleteImagePaths({
				posters: [{ file_path: null, iso_639_1: "en" }],
				logos: [{ file_path: undefined }],
			});

			expect(result.posters[0]?.file_path).toBe("/poster-ph.png");
			expect(result.logos[0]?.file_path).toBe("/logo-ph.png");
		});

		test("null file_path in collection with no matching fallback stays null", () => {
			const imageAPI = new ImageAPI({ fallback_url: { posters: "/poster-ph.png" } });

			const result = imageAPI.autocompleteImagePaths({
				backdrops: [{ file_path: null }],
			});

			expect(result.backdrops[0]?.file_path).toBeNull();
		});

		test("fallback is nested/recursive — applies inside nested objects", () => {
			const imageAPI = new ImageAPI({ fallback_url: "/placeholder.png" });

			const result = imageAPI.autocompleteImagePaths({
				movie: { poster_path: null, title: "Inception" },
			});

			expect(result.movie.poster_path).toBe("/placeholder.png");
			expect(result.movie.title).toBe("Inception");
		});

		test("non-image null fields are left untouched", () => {
			const imageAPI = new ImageAPI({ fallback_url: "/placeholder.png" });

			const result = imageAPI.autocompleteImagePaths({
				overview: null,
				tagline: null,
				poster_path: null,
			});

			expect(result.overview).toBeNull();
			expect(result.tagline).toBeNull();
			expect(result.poster_path).toBe("/placeholder.png");
		});
	});
});
