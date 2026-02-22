import {
	TVAggregateCreditsParams,
	TVAlternativeTitles,
	TVBaseParam,
	TVChangeParams,
	TVCredits,
	TVCreditsParams,
	TVDetailsParams,
	TVExternalIDs,
	TVImages,
	TVImagesParams,
	TVKeywords,
	TVRecommendations,
	TVRecommendationsParams,
	TVSeriesChanges,
	TVSeriesListsParams,
} from "../types/tv";
import { TVAggregateCredits } from "../types/tv/aggregate_credits";
import { TVContentRatings } from "../types/tv/content_ratings";
import { TVEpisodeGroups } from "../types/tv/episode_groups";
import { TVSeriesLists } from "../types/tv/lists";
import { TVAppendToResponseNamespace, TVSeriesDetails, TVDetailsWithAppends } from "../types/tv/tv_series";
import { TMDBAPIBase } from "./base";

export const TV_SERIES_ENDPOINTS = {
	TV: "/tv",
	TV_AGGREGATE_CREDITS: "/aggregate_credits",
	TV_ALTERNATIVE_TITLES: "/alternative_titles",
	TV_CHANGES: "/changes",
	TV_CONTENT_RATINGS: "/content_ratings",
	TV_CREDITS: "/credits",
	TV_EPISODE_GROUPS: "/episode_groups",
	TV_EXTERNAL_IDS: "/external_ids",
	TV_IMAGES: "/images",
	TV_KEYWORDS: "/keywords",
	TV_LATEST: "/latest",
	TV_LISTS: "/lists",
	TV_RECOMMENDATIONS: "/recommendations",
};

export class TVSeriesAPI extends TMDBAPIBase {
	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/tv/{series_id}
	 *
	 * Get the top level details of a TV series by ID.
	 * @param series_id The ID of the TV series.
	 * @param append_to_response A comma-separated list of the fields to include in the response.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the TV series details.
	 * @reference https://developer.themoviedb.org/reference/tv-series-details
	 */
	async details<T extends readonly TVAppendToResponseNamespace[] = []>(
		params: TVDetailsParams & { append_to_response?: T[number] | T },
	): Promise<T extends [] ? TVSeriesDetails : TVDetailsWithAppends<T>> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}`;
		return this.client.request(endpoint, { language, ...rest });
	}

	/**
	 * Aggregate Credits
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/aggregate_credits
	 *
	 * Get the aggregate credits (cast and crew) that have been added to a TV show.
	 *
	 * NOTE: This call differs from the main credits call in that it does not return the newest season.
	 * Instead, it is a view of all the entire cast & crew for all episodes belonging to a TV show.
	 * @param series_id The ID of the TV series.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the TV series aggregate credits.
	 * @reference https://developer.themoviedb.org/reference/tv-series-aggregate-credits
	 */
	async aggregate_credits(params: TVAggregateCreditsParams): Promise<TVAggregateCredits> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_AGGREGATE_CREDITS}`;
		return this.client.request(endpoint, { language, ...rest });
	}

	/**
	 * Alternative Titles
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/alternative_tiles
	 *
	 * Get the alternative titles that have been added to a TV show.
	 * @param series_id The ID of the TV series.
	 * @returns A promise that resolves to the TV series alternative tiles.
	 * @reference https://developer.themoviedb.org/reference/tv-series-alternative-titles
	 */
	async alternative_titles(params: TVBaseParam): Promise<TVAlternativeTitles> {
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_ALTERNATIVE_TITLES}`;
		return this.client.request(endpoint);
	}

	/**
	 * Changes
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/changes
	 *
	 * Get the changes for a TV show. By default only the last 24 hours are returned.
	 * You can query up to 14 days in a single query by using the start_date and end_date query parameters.
	 *
	 * NOTE: TV show changes are a little different than movie changes in that there are some edits
	 * on seasons and episodes that will create a top level change entry at the show level.
	 * These can be found under the season and episode keys.
	 * These keys will contain a series_id and episode_id.
	 * You can use the season changes and episode changes methods to look these up individually.
	 *
	 * @param series_id The ID of the TV series.
	 * @returns A promise that resolves to the TV series changes history.
	 * @reference https://developer.themoviedb.org/reference/tv-series-changes
	 */
	async changes(params: TVChangeParams): Promise<TVSeriesChanges> {
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_CHANGES}`;
		return this.client.request(endpoint, { ...params });
	}

	/**
	 * Content Ratings
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/content_ratings
	 *
	 * Get the content ratings that have been added to a TV show.
	 * @param series_id The ID of the TV series.
	 * @returns A promise that resolves to the TV series content ratings.
	 * @reference https://developer.themoviedb.org/reference/tv-series-content-ratings
	 */
	async content_ratings(params: TVBaseParam): Promise<TVContentRatings> {
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_CONTENT_RATINGS}`;
		return this.client.request(endpoint);
	}

	/**
	 * Credits
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/credits
	 *
	 * Get the latest season credits of a TV show.
	 *
	 * This is the original TV credits method which returns the latest season credit data.
	 * If you would like to request the aggregate view (which is what you see on our website)
	 * you should use the /aggregate_credits method.
	 * @param series_id The ID of the TV series.
	 * @param language The Language for the credits
	 * @returns A promise that resolves to the TV series credits.
	 * @reference https://developer.themoviedb.org/reference/tv-series-credits
	 */
	async credits(params: TVCreditsParams): Promise<TVCredits> {
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_CREDITS}`;
		const { language = this.defaultOptions.language, ...rest } = params;
		return this.client.request(endpoint, { language, ...rest });
	}

	/**
	 * Episode Groups
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/episode_groups
	 *
	 * Get the episode groups that have been added to a TV show.
	 * With a group ID you can call the get TV episode group details method.
	 * @param series_id The ID of the TV series.
	 * @returns A promise that resolves to the TV series episode groups.
	 * @reference https://developer.themoviedb.org/reference/tv-series-episode-groups
	 */
	async episode_groups(params: TVBaseParam): Promise<TVEpisodeGroups> {
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_EPISODE_GROUPS}`;
		return this.client.request(endpoint);
	}

	/**
	 * External IDs
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/external_ids
	 *
	 * Get a list of external IDs that have been added to a TV show.
	 * @param series_id The ID of the TV series.
	 * @returns A promise that resolves to the TV series external ids.
	 * @reference https://developer.themoviedb.org/reference/tv-series-external-ids
	 */
	async external_ids(params: TVBaseParam): Promise<TVExternalIDs> {
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_EXTERNAL_IDS}`;
		return this.client.request(endpoint);
	}

	/**
	 * Images
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/images
	 *
	 * Fetches images related to a specific tv show, such as posters and backdrops.
	 * The images are returned in various sizes and formats.
	 *
	 * NOTE: If you have a language specified, it will act as a filter on the returned items. You can use the include_image_language param to query additional languages.
	 *
	 * @param series_id - The unique identifier of the tv show.
	 * @param language - (Optional) The language code to filter the images by language.
	 * @param include_image_language - (Optional) A comma-separated list of language codes to include images for.
	 * @returns A promise that resolves to a `TVImages` object containing the tv show's images.
	 * @reference https://developer.themoviedb.org/reference/tv-series-images
	 */
	async images(params: TVImagesParams): Promise<TVImages> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_IMAGES}`;
		return this.client.request(endpoint, { language, ...rest });
	}

	/**
	 * Keywords
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/keywords
	 *
	 * Get a list of keywords that have been added to a TV show.
	 * @param series_id The ID of the TV series.
	 * @returns A promise that resolves to the TV series keywords.
	 * @reference https://developer.themoviedb.org/reference/tv-series-keywords
	 */
	async keywords(params: TVBaseParam): Promise<TVKeywords> {
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_KEYWORDS}`;
		return this.client.request(endpoint);
	}

	/**
	 * Latest
	 * GET - https://api.themoviedb.org/3/tv/latest
	 *
	 * Get the newest tv show.
	 * This is a live response and will continuosly change.
	 * @returns A promise that resolves to the lastest TV series.
	 * @reference https://developer.themoviedb.org/reference/tv-series-latest-id
	 */
	async latest(): Promise<TVSeriesDetails> {
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}${TV_SERIES_ENDPOINTS.TV_LATEST}`;
		return this.client.request(endpoint);
	}

	/**
	 * Lists
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/lists
	 *
	 * Get the lists that a TV series has been added to.
	 * @param series_id The ID of the TV series.
	 * @param language The Language for the lists
	 * @param page Page number (paginated response)
	 * @returns A promise that resolves to the TV series lists.
	 * @reference https://developer.themoviedb.org/reference/lists-copy (TODO: Check this url for updates, it's like this on TMDB docs (??))
	 */
	async lists(params: TVSeriesListsParams): Promise<TVSeriesLists> {
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_LISTS}`;
		const { language = this.defaultOptions.language, ...rest } = params;
		return this.client.request(endpoint, { language, ...rest });
	}

	/**
	 * Recomendations
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/recommendations
	 *
	 * Get the recommendations shows for a TV series.
	 * @param series_id The ID of the TV series.
	 * @param language The Language for the lists
	 * @param page Page number (paginated response)
	 * @returns A promise that resolves to TV series recommended shows.
	 * @reference https://developer.themoviedb.org/reference/tv-series-recommendations
	 */
	async recommendations(params: TVRecommendationsParams): Promise<TVRecommendations> {
		const endpoint = `${TV_SERIES_ENDPOINTS.TV}/${params.series_id}${TV_SERIES_ENDPOINTS.TV_RECOMMENDATIONS}`;
		const { language = this.defaultOptions.language, ...rest } = params;
		return this.client.request(endpoint, { language, ...rest });
	}
}
