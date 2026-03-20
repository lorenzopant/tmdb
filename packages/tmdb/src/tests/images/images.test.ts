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
});
