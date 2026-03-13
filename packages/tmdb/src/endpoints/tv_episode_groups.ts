import { ENDPOINTS } from "../routes";
import { TVEpisodeGroupDetails, TVEpisodeGroupParams } from "../types/other/tv_episode_groups";
import { TMDBAPIBase } from "./base";

export class TVEpisodeGroupsAPI extends TMDBAPIBase {
	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/tv/episode_group/{episode_group_id}
	 *
	 * Get the details of a TV episode group by ID.
	 * @param episode_group_id The ID of the episode group.
	 * @reference https://developer.themoviedb.org/reference/tv-episode-group-details
	 */
	async details(params: TVEpisodeGroupParams): Promise<TVEpisodeGroupDetails> {
		const endpoint = `${ENDPOINTS.TV_EPISODE_GROUPS.DETAILS}/${params.episode_group_id}`;
		return this.client.request<TVEpisodeGroupDetails>(endpoint);
	}
}
