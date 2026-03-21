import { describe, expect, it } from "vitest";

import { TMDBError } from "../../errors/tmdb";
import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, please set it in your environment variables.");

const tmdb = new TMDB(token);

// A known stable review on TMDB (The Last of Us review by eXo)
const KNOWN_REVIEW_ID = "640b2aeecaaca20079decdcc";

describe("ReviewsAPI (integration)", () => {
	it("should get review details by ID", async () => {
		const review = await tmdb.reviews.details({ review_id: KNOWN_REVIEW_ID });

		expect(review).toBeDefined();
		expect(review.id).toBe(KNOWN_REVIEW_ID);
		expect(review.author).toBeDefined();
		expect(review.content).toBeDefined();
		expect(review.media_id).toBeDefined();
		expect(review.media_type).toMatch(/^(movie|tv)$/);
	});

	it("should throw TMDBError for an invalid review ID", async () => {
		try {
			await tmdb.reviews.details({ review_id: "invalid-review-id-000" });
			throw new Error("Expected TMDBError was not thrown");
		} catch (error) {
			expect(error).toBeInstanceOf(TMDBError);
		}
	});
});
