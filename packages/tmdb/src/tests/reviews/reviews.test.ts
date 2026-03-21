import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { ReviewsAPI } from "../../endpoints/reviews";

describe("ReviewsAPI", () => {
	let clientMock: ApiClient;
	let api: ReviewsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		api = new ReviewsAPI(clientMock);
	});

	it("should call client.request with the correct endpoint", async () => {
		const review_id = "5acbc4e7c3a36814d01009f6";

		await api.details({ review_id });

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith(`/review/${review_id}`);
	});

	it("should return the result from client.request", async () => {
		const mockReview = {
			id: "5acbc4e7c3a36814d01009f6",
			author: "eXo",
			author_details: { name: "", username: "eXo", avatar_path: undefined, rating: undefined },
			content: "Great movie!",
			created_at: "2018-04-09T22:23:19.000Z",
			updated_at: "2021-06-23T15:58:10.000Z",
			url: "https://www.themoviedb.org/review/5acbc4e7c3a36814d01009f6",
			iso_639_1: "en",
			media_id: 19404,
			media_title: "Dilwale Dulhania Le Jayenge",
			media_type: "movie" as const,
		};

		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(mockReview);

		const result = await api.details({ review_id: "5acbc4e7c3a36814d01009f6" });

		expect(result).toEqual(mockReview);
	});
});
