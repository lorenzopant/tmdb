import { ENDPOINTS } from "../routes";
import {
	Changes,
	TVEpisode,
	TVEpisodeAppendToResponseNamespace,
	TVEpisodeBaseParams,
	TVEpisodeCredits,
	TVEpisodeCreditsParams,
	TVEpisodeDetailsParams,
	TVEpisodeDetailsWithAppends,
	TVEpisodeExternalIDs,
	TVEpisodeId,
	TVEpisodeImages,
	TVEpisodeImagesParams,
	TVEpisodeTranslations,
	TVEpisodeVideos,
} from "../types";

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
		const endpoint = `${ENDPOINTS.TV_SERIES.DETAILS}${ENDPOINTS.TV_EPISODES.DETAILS}/${params.episode_id}${ENDPOINTS.TV_EPISODES.CHANGES}`;
		return this.client.request(endpoint);
	}

	/**
	 * Credits
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/credits
	 *
	 * Get the credits for a TV episode.
	 * @param series_id The ID of the TV series.
	 * @param season_number The number of the season within the TV show
	 * @param episode_number The number of the episode within the season
	 * @param language The language to use for the response.
	 * @reference https://developer.themoviedb.org/reference/tv-episode-credits
	 */
	async credits(params: TVEpisodeCreditsParams): Promise<TVEpisodeCredits> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = this.episodeSubPath(rest, ENDPOINTS.TV_EPISODES.CREDITS);
		return this.client.request(endpoint, { language });
	}

	/**
	 * External IDs
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/external_ids
	 *
	 * Get a list of external IDs that have been added to a TV episode.
	 * @param series_id The ID of the TV series.
	 * @param season_number The number of the season within the TV show
	 * @param episode_number The number of the episode within the season
	 * @returns A promise that resolves to the TV episode external ids.
	 * @reference https://developer.themoviedb.org/reference/tv-episode-external-ids
	 */
	async external_ids(params: TVEpisodeBaseParams): Promise<TVEpisodeExternalIDs> {
		const endpoint = this.episodeSubPath(params, ENDPOINTS.TV_EPISODES.EXTERNAL_IDS);
		return this.client.request(endpoint);
	}

	/**
	 * Images
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/images
	 *
	 * Fetches still images related to a specific tv episode
	 * The images are returned in various sizes and formats.
	 *
	 * NOTE: If you have a language specified, it will act as a filter on the returned items. You can use the include_image_language param to query additional languages.
	 *
	 * @param series_id The ID of the TV series.
	 * @param season_number The number of the season within the TV show
	 * @param episode_number The number of the episode within the season
	 * @param language - (Optional) The language code to filter the images by language.
	 * @param include_image_language - (Optional) A comma-separated list of language codes to include images for.
	 * @returns A promise that resolves to a `TVEpisodeImages` object containing the tv episode's images.
	 * @reference https://developer.themoviedb.org/reference/tv-episode-images
	 */
	async images(params: TVEpisodeImagesParams): Promise<TVEpisodeImages> {
		const { language = this.defaultOptions.language, include_image_language, ...rest } = params;
		const endpoint = this.episodeSubPath(rest, ENDPOINTS.TV_EPISODES.IMAGES);
		return this.client.request(endpoint, this.injectImageLanguage({ language, include_image_language }));
	}

	/**
	 * Translations
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/translations
	 *
	 * Get the translations that have been added to a TV episode.
	 * Take a read through our language documentation for more information about languages on TMDB.
	 * https://developer.themoviedb.org/docs/languages
	 * @param series_id The ID of the TV series.
	 * @param season_number The number of the season within the TV show
	 * @param episode_number The number of the episode within the season
	 * @returns A promise that resolves to the translations of the tv episode.
	 * @reference https://developer.themoviedb.org/reference/tv-episode-translations
	 */
	async translations(params: TVEpisodeBaseParams): Promise<TVEpisodeTranslations> {
		const endpoint = this.episodeSubPath(params, ENDPOINTS.TV_EPISODES.TRANSLATIONS);
		return this.client.request<TVEpisodeTranslations>(endpoint);
	}

	/**
	 * Videos
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/episode/{episode_number}/videos
	 *
	 * Get the videos that belong to a TV episode.
	 * @param series_id The ID of the TV series.
	 * @param season_number The number of the season within the TV show
	 * @param episode_number The number of the episode within the season
	 * @returns A promise that resolves to the videos for the tv episode.
	 * @reference https://developer.themoviedb.org/reference/tv-episode-videos
	 */
	async videos(params: TVEpisodeBaseParams): Promise<TVEpisodeVideos> {
		const endpoint = this.episodeSubPath(params, ENDPOINTS.TV_EPISODES.VIDEOS);
		return this.client.request<TVEpisodeVideos>(endpoint);
	}
}
