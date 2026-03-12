import { ENDPOINTS } from "../routes";
import { Changes } from "../types";
import { TVEpisodeBaseParams, TVEpisodeDetailsParams, TVEpisodeId } from "../types/tv-episodes/params";
import { TVEpisode, TVEpisodeAppendToResponseNamespace, TVEpisodeDetailsWithAppends } from "../types/tv-episodes/tv_episodes";
import { TMDBAPIBase } from "./base";

export class TVEpisodesAPI extends TMDBAPIBase {
	private episodePath(params: TVEpisodeBaseParams): string {
		return `${ENDPOINTS.TV_SERIES.DETAILS}/${params.series_id}${ENDPOINTS.TV_SEASONS.DETAILS}/${params.season_number}${ENDPOINTS.TV_EPISODES.DETAILS}/${params.episode_number}`;
	}

	private episodeSubPath(params: TVEpisodeBaseParams, route: string): string {
		return `${this.episodePath(params)}${route}`;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/episode/{episode_number}
	 *
	 * Query the details of a TV episode.
	 * @param series_id The ID of the TV series.
	 * @param season_number The number of the season within the TV show
	 * @param episode_number The number of the episode within the season
	 * @param append_to_response A comma-separated list of the fields to include in the response.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the TV episode .
	 * @reference https://developer.themoviedb.org/reference/tv-episode-details
	 */
	async details<T extends readonly TVEpisodeAppendToResponseNamespace[] = []>(
		params: TVEpisodeDetailsParams & { append_to_response?: T[number] | T },
	): Promise<T extends [] ? TVEpisode : TVEpisodeDetailsWithAppends<T>> {
		const { language = this.defaultOptions.language, append_to_response, ...rest } = params;
		const endpoint = this.episodePath(rest);
		return this.client.request(endpoint, { language, append_to_response });
	}

	/**
	 * Changes
	 * GET - https://api.themoviedb.org/3/tv/episode/{episode_id}/changes
	 *
	 * Get the changes for a TV episode. By default only the last 24 hours are returned.
	 * ACCORDING TO TMDB DOCS:
	 * You can query up to 14 days in a single query by using the start_date and end_date query parameters.
	 * BUT NO start_date or end_date query params are specified in the documentation
	 *
	 * NOTE: TV show changes are a little different than movie changes in that there are some edits
	 * on seasons and episodes that will create a top level change entry at the show level.
	 * These can be found under the season and episode keys.
	 * These keys will contain a series_id and episode_id.
	 * You can use the season changes and episode changes methods to look these up individually.
	 *
	 * @param episode_id The ID of the TV episode.
	 * @returns A promise that resolves to the TV episode changes history.
	 * @reference https://developer.themoviedb.org/reference/tv-episode-changes-by-id
	 */
	async changes(params: TVEpisodeId): Promise<Changes> {
		const endpoint = `${ENDPOINTS.TV_SERIES.DETAILS}/${ENDPOINTS.TV_EPISODES.DETAILS}/${params.episode_id}/${ENDPOINTS.TV_EPISODES.CHANGES}`;
		return this.client.request(endpoint, { ...params });
	}
}
