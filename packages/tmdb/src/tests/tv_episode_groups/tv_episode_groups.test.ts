import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { TVEpisodeGroupsAPI } from "../../endpoints/tv_episode_groups";

describe("TVEpisodeGroupsAPI", () => {
	let clientMock: ApiClient;
	let tvEpisodeGroupsAPI: TVEpisodeGroupsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		tvEpisodeGroupsAPI = new TVEpisodeGroupsAPI(clientMock);
	});

	describe("details", () => {
		it("should call client.request with the correct endpoint and no params", async () => {
			await tvEpisodeGroupsAPI.details({ episode_group_id: "5acf93e60e0a26346d0000ce" });
			expect(clientMock.request).toHaveBeenCalledOnce();
			expect(clientMock.request).toHaveBeenCalledWith("/tv/episode_group/5acf93e60e0a26346d0000ce");
		});

		it("should return the result from client.request", async () => {
			const fakeResponse = { id: "5acf93e60e0a26346d0000ce", name: "Aired Order", groups: [] };
			(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
			const result = await tvEpisodeGroupsAPI.details({ episode_group_id: "5acf93e60e0a26346d0000ce" });
			expect(result).toEqual(fakeResponse);
		});
	});
});
