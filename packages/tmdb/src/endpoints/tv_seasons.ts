import { ENDPOINTS } from "../routes";
import {
	Changes,
	MediaWatchProviders,
	TVSeasonAggregateCredits,
	TVSeasonAggregateCreditsParams,
	TVSeasonAppendToResponseNamespace,
	TVSeasonBaseParams,
	TVSeasonChangesParams,
	TVSeasonCredits,
	TVSeasonCreditsParams,
	TVSeasonDetailsParams,
	TVSeasonDetailsWithAppends,
	TVSeasonExternalIDs,
	TVSeasonImages,
	TVSeasonImagesParams,
	TVSeasonTranslations,
	TVSeasonVideos,
	TVSeasonVideosParams,
	TVSeasonWatchProvidersParams,
	TVSeason,
} from "../types";

import { TMDBAPIBase } from "./base";

export class TVSeasonsAPI extends TMDBAPIBase {
	private seasonPath(params: TVSeasonBaseParams): string {
		return `${ENDPOINTS.TV_SERIES.DETAILS}/${params.series_id}${ENDPOINTS.TV_SEASONS.DETAILS}/${params.season_number}`;
	}

	private seasonSubPath(params: TVSeasonBaseParams, route: string): string {
		return `${this.seasonPath(params)}${route}`;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}
	 *
	 * Query the details of a TV season.
	 * @param series_id The ID of the TV series.
	 * @param season_number The season number within the TV show.
	 * @param append_to_response A comma-separated list of the fields to include in the response.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the TV season details.
	 * @reference https://developer.themoviedb.org/reference/tv-season-details
	 */
	async details<T extends readonly TVSeasonAppendToResponseNamespace[] = []>(
		params: Omit<TVSeasonDetailsParams, "append_to_response"> & { append_to_response?: T },
	): Promise<T extends [] ? TVSeason : TVSeasonDetailsWithAppends<T>> {
		const { language = this.defaultOptions.language, append_to_response, ...rest } = params;
		const endpoint = this.seasonPath(rest);
		return this.client.request(endpoint, { language, append_to_response });
	}

	/**
	 * Aggregate Credits
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/aggregate_credits
	 *
	 * Get the aggregate credits for a TV season.
	 * This returns the full cast and crew across all episodes of the season.
	 * @param series_id The ID of the TV series.
	 * @param season_number The season number within the TV show.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the TV season aggregate credits.
	 * @reference https://developer.themoviedb.org/reference/tv-season-aggregate-credits
	 */
	async aggregate_credits(params: TVSeasonAggregateCreditsParams): Promise<TVSeasonAggregateCredits> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = this.seasonSubPath(rest, ENDPOINTS.TV_SEASONS.AGGREGATE_CREDITS);
		return this.client.request(endpoint, { language });
	}

	/**
	 * Changes
	 * GET - https://api.themoviedb.org/3/tv/season/{season_id}/changes
	 *
	 * Get the changes for a TV season by season ID. By default only the last 24 hours are returned.
	 * You can query up to 14 days in a single query by using the start_date and end_date query parameters.
	 * @param season_id The ID of the TV season.
	 * @param start_date Filter changes by start date (ISO 8601 format, e.g. "2024-01-01").
	 * @param end_date Filter changes by end date (ISO 8601 format, e.g. "2024-01-14").
	 * @param page The page of results to return.
	 * @returns A promise that resolves to the TV season changes history.
	 * @reference https://developer.themoviedb.org/reference/tv-season-changes-by-id
	 */
	async changes(params: TVSeasonChangesParams): Promise<Changes> {
		const { season_id, ...rest } = params;
		const endpoint = `${ENDPOINTS.TV_SERIES.DETAILS}${ENDPOINTS.TV_SEASONS.DETAILS}/${season_id}${ENDPOINTS.TV_SEASONS.CHANGES}`;
		return this.client.request(endpoint, { ...rest });
	}

	/**
	 * Credits
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/credits
	 *
	 * Get the credits for a TV season.
	 * @param series_id The ID of the TV series.
	 * @param season_number The season number within the TV show.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the TV season credits.
	 * @reference https://developer.themoviedb.org/reference/tv-season-credits
	 */
	async credits(params: TVSeasonCreditsParams): Promise<TVSeasonCredits> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = this.seasonSubPath(rest, ENDPOINTS.TV_SEASONS.CREDITS);
		return this.client.request(endpoint, { language });
	}

	/**
	 * External IDs
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/external_ids
	 *
	 * Get a list of external IDs that have been added to a TV season.
	 * @param series_id The ID of the TV series.
	 * @param season_number The season number within the TV show.
	 * @returns A promise that resolves to the TV season external IDs.
	 * @reference https://developer.themoviedb.org/reference/tv-season-external-ids
	 */
	async external_ids(params: TVSeasonBaseParams): Promise<TVSeasonExternalIDs> {
		const endpoint = this.seasonSubPath(params, ENDPOINTS.TV_SEASONS.EXTERNAL_IDS);
		return this.client.request(endpoint);
	}

	/**
	 * Images
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/images
	 *
	 * Get the images that belong to a TV season. Returns season posters.
	 *
	 * NOTE: If you have a language specified, it will act as a filter on the returned items.
	 * You can use the include_image_language param to query additional languages.
	 *
	 * @param series_id The ID of the TV series.
	 * @param season_number The season number within the TV show.
	 * @param language The language code to filter images by language.
	 * @param include_image_language A comma-separated list of language codes to include images for.
	 * @returns A promise that resolves to the TV season images.
	 * @reference https://developer.themoviedb.org/reference/tv-season-images
	 */
	async images(params: TVSeasonImagesParams): Promise<TVSeasonImages> {
		const { language = this.defaultOptions.language, include_image_language, ...rest } = params;
		const endpoint = this.seasonSubPath(rest, ENDPOINTS.TV_SEASONS.IMAGES);
		return this.client.request(endpoint, { language, include_image_language });
	}

	/**
	 * Translations
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/translations
	 *
	 * Get the translations that have been added to a TV season.
	 * Take a read through our language documentation for more information about languages on TMDB.
	 * https://developer.themoviedb.org/docs/languages
	 * @param series_id The ID of the TV series.
	 * @param season_number The season number within the TV show.
	 * @returns A promise that resolves to the TV season translations.
	 * @reference https://developer.themoviedb.org/reference/tv-season-translations
	 */
	async translations(params: TVSeasonBaseParams): Promise<TVSeasonTranslations> {
		const endpoint = this.seasonSubPath(params, ENDPOINTS.TV_SEASONS.TRANSLATIONS);
		return this.client.request<TVSeasonTranslations>(endpoint);
	}

	/**
	 * Videos
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/videos
	 *
	 * Get the videos that belong to a TV season.
	 * @param series_id The ID of the TV series.
	 * @param season_number The season number within the TV show.
	 * @param language The language to use for the response.
	 * @param include_video_language A comma-separated list of language codes to include videos for.
	 * @returns A promise that resolves to the TV season videos.
	 * @reference https://developer.themoviedb.org/reference/tv-season-videos
	 */
	async videos(params: TVSeasonVideosParams): Promise<TVSeasonVideos> {
		const { language = this.defaultOptions.language, include_video_language, ...rest } = params;
		const endpoint = this.seasonSubPath(rest, ENDPOINTS.TV_SEASONS.VIDEOS);
		return this.client.request<TVSeasonVideos>(endpoint, { language, include_video_language });
	}

	/**
	 * Watch Providers
	 * GET - https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}/watch/providers
	 *
	 * Get the watch providers for a specific TV season.
	 * Powered by our partnership with JustWatch, you can query which streaming services
	 * have the season available.
	 * @param series_id The ID of the TV series.
	 * @param season_number The season number within the TV show.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the TV season watch providers.
	 * @reference https://developer.themoviedb.org/reference/tv-season-watch-providers
	 */
	async watch_providers(params: TVSeasonWatchProvidersParams): Promise<MediaWatchProviders> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = this.seasonSubPath(rest, ENDPOINTS.TV_SEASONS.WATCH_PROVIDERS);
		return this.client.request<MediaWatchProviders>(endpoint, { language });
	}
}
