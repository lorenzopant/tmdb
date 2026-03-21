import { ENDPOINTS } from "../routes";
import type { ReviewDetails, ReviewDetailsParams } from "../types/reviews";
import { TMDBAPIBase } from "./base";

export class ReviewsAPI extends TMDBAPIBase {
	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/review/{review_id}
	 *
	 * Retrieve the details of a single review by its TMDB review ID.
	 * @param review_id The TMDB review identifier.
	 * @returns A promise that resolves to the full review details.
	 * @reference https://developer.themoviedb.org/reference/review-details
	 */
	async details(params: ReviewDetailsParams): Promise<ReviewDetails> {
		return this.client.request<ReviewDetails>(`${ENDPOINTS.REVIEWS.DETAILS}/${params.review_id}`);
	}
}
