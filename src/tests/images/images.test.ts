import { describe, expect, test } from "vitest";
import { IMAGE_SECURE_BASE_URL, IMAGE_BASE_URL } from "../../types/config/images";
import { ImageAPI } from "../../images/images";

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

	test("should generate logo URL", () => {
		const imageAPI = new ImageAPI();
		const url = imageAPI.logo(path, "w300");
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w300${path}`);
	});

	test("should generate profile URL", () => {
		const imageAPI = new ImageAPI();
		const url = imageAPI.profile(path, "h632");
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}h632${path}`);
	});

	test("should generate still URL", () => {
		const imageAPI = new ImageAPI();
		const url = imageAPI.still(path, "w300");
		expect(url).toBe(`${IMAGE_SECURE_BASE_URL}w300${path}`);
	});
});
