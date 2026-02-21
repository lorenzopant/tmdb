import { ApiClient } from "../client";
import { TMDBOptions } from "../types/config";
import {
	MovieAlternativeTitles,
	MovieAppendToResponseNamespace,
	MovieCredits,
	MovieDetails,
	MovieDetailsWithAppends,
	MovieExternalIDs,
	MovieImages,
	MovieKeywords,
	MovieRecommendations,
	MovieReleaseDates,
	MovieReviews,
	MovieSimilar,
	MovieTranslations,
	MovieVideos,
	MovieWatchProvider,
} from "../types/movies";
import { MovieChanges } from "../types/movies/changes";
import {
	MovieAlternativeTitlesParams,
	MovieChangesParams,
	MovieCreditsParams,
	MovieDetailsParams,
	MovieExternalIDsParams,
	MovieImagesParams,
	MovieKeywordsParams,
	MovieRecommendationsParams,
	MovieReleaseDatesParams,
	MovieReviewsParams,
	MovieSimilarParams,
	MovieTranslationsParams,
	MovieVideosParams,
	MovieWatchProvidersParams,
} from "../types/movies/params";

export const MOVIE_ENDPOINTS = {
	MOVIE: "/movie",
	ALTERNATIVE_TITLES: "/alternative_titles",
	CREDITS: "/credits",
	EXTERNAL_IDS: "/external_ids",
	KEYWORDS: "/keywords",
	CHANGES: "/changes",
	IMAGES: "/images",
	LATEST: "/latest",
	RECOMMENDATIONS: "/recommendations",
	RELEASE_DATES: "/release_dates",
	SIMILAR: "/similar",
	TRANSLATIONS: "/translations",
	VIDEOS: "/videos",
	WATCH_PROVIDERS: "/watch/providers",
	REVIEWS: "/reviews",
	// Missing:
	// ACCOUNT_STATES
	// LISTS
	// ADD RATING
	// DELETE RATING
};

export class MoviesAPI {
	private client: ApiClient;
	private defaultOptions: TMDBOptions;

	constructor(client: ApiClient, options: TMDBOptions = {}) {
		this.client = client;
		this.defaultOptions = options;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}
	 *
	 * Get the top level details of a movie by ID.
	 * @param movie_id The ID of the movie.
	 * @param append_to_response A comma-separated list of the fields to include in the response.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the movie details.
	 * @reference https://developer.themoviedb.org/reference/movie-details
	 */
	async details<T extends readonly MovieAppendToResponseNamespace[] = []>(
		params: MovieDetailsParams & { append_to_response?: T[number] | T },
	): Promise<T extends [] ? MovieDetails : MovieDetailsWithAppends<T>> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}`;
		return this.client.request(endpoint, { language, ...rest });
	}

	/**
	 * Alternative Titles
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/alternative_titles
	 *
	 * Get the alternative titles for a movie (ex. Russian name, Indian names etc..).
	 * @param movie_id The ID of the movie.
	 * @param country The ISO 3166-1 code of the country to get alternative titles for.
	 * @returns A promise that resolves to the movie alternative titles.
	 * @reference https://developer.themoviedb.org/reference/movie-alternative-titles
	 */
	async alternative_titles(params: MovieAlternativeTitlesParams): Promise<MovieAlternativeTitles> {
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.ALTERNATIVE_TITLES}`;
		return this.client.request<MovieAlternativeTitles>(endpoint, params);
	}

	/**
	 * Credits
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/credits
	 *
	 * Get the cast and crew members details for a movie.
	 * @param movie_id The ID of the movie.
	 * @param language The ISO 639-1 code of the language to use for the response. Default is "en-US".
	 * @returns A promise that resolves to the movie credits.
	 * @reference https://developer.themoviedb.org/reference/movie-credits
	 */
	async credits(params: MovieCreditsParams): Promise<MovieCredits> {
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.CREDITS}`;
		const { language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<MovieCredits>(endpoint, { language, ...rest });
	}

	/**
	 * External IDs
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/external_ids
	 *
	 * Get the external IDs for a movie (ex. IMDB, Facebook, Instagram etc..).
	 * Supported external IDs are: IMDB, Facebook, Instagram, Twitter, and Wikidata.
	 *
	 * @param movie_id The ID of the movie.
	 * @returns A promise that resolves to the movie external IDs.
	 * @reference https://developer.themoviedb.org/reference/movie-external-ids
	 */
	async external_ids(params: MovieExternalIDsParams): Promise<MovieExternalIDs> {
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.EXTERNAL_IDS}`;
		return this.client.request<MovieExternalIDs>(endpoint);
	}

	/**
	 * Keywords
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/keywords
	 *
	 * Get the keywords that have been added to a movie.
	 * This is a list of keywords that have been added to the movie.
	 * @param movie_id The ID of the movie.
	 * @returns A promise that resolves to the movie keywords.
	 * @reference https://developer.themoviedb.org/reference/movie-keywords
	 */
	async keywords(params: MovieKeywordsParams): Promise<MovieKeywords> {
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.KEYWORDS}`;
		return this.client.request<MovieKeywords>(endpoint);
	}

	/**
	 * Changes
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/changes
	 *
	 * Get the changes for a movie. This is a list of all the changes that have been made to a movie.
	 * By default, only the last 24 hours are returned.
	 * You can query up to 14 days in a single query by using the start_date and end_date query parameters.
	 * @param movie_id The ID of the movie.
	 * @param page Page number of the results to return. Defaults to 1.
	 * @param start_date Optional start date for the changes. Format: YYYY-MM-DD.
	 * @param end_date Optional end date for the changes. Format: YYYY-MM-DD.
	 * @returns A promise that resolves to the changes made to the movie.
	 * @reference https://developer.themoviedb.org/reference/movie-changes
	 */
	async changes(params: MovieChangesParams): Promise<MovieChanges> {
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.CHANGES}`;
		return this.client.request<MovieChanges>(endpoint, params);
	}

	/**
	 * Images
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/images
	 *
	 * Fetches images related to a specific movie, such as posters and backdrops.
	 * The images are returned in various sizes and formats.
	 *
	 * If you have a language specified, it will act as a filter on the returned items. You can use the include_image_language param to query additional languages.
	 *
	 * @param movie_id - The unique identifier of the movie.
	 * @param language - (Optional) The language code to filter the images by language.
	 * @param include_image_language - (Optional) A comma-separated list of language codes to include images for.
	 * @returns A promise that resolves to a `MovieImages` object containing the movie's images.
	 * @reference https://developer.themoviedb.org/reference/movie-images
	 */
	async images(params: MovieImagesParams): Promise<MovieImages> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.IMAGES}`;
		return this.client.request<MovieImages>(endpoint, { language, ...rest });
	}

	/**
	 * Latest
	 * GET - https://api.themoviedb.org/3/movie/latest
	 *
	 * Get the newest movie ID.
	 * This is the most recent movie that has been added to TMDB. This is a live response will continuously change as new movies are added.
	 * @returns A promise that resolves to the latest movie details.
	 * @reference https://developer.themoviedb.org/reference/movie-latest-id
	 */
	async latest(): Promise<MovieDetails> {
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}${MOVIE_ENDPOINTS.LATEST}`;
		return this.client.request<MovieDetails>(endpoint);
	}

	/**
	 * Recommendations
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/recommendations
	 *
	 * Get a list of recommended movies for a specific movie.
	 * This is based on the movie's popularity and user ratings.
	 * @param movie_id The ID of the movie.
	 * @param page Page number of the results to return. Defaults to 1.
	 * @param language Language code to filter the results. Default is "en-US".
	 * @returns A promise that resolves to a paginated response of similar movies.
	 * @reference https://developer.themoviedb.org/reference/movie-recommendations
	 */
	async recommendations(params: MovieRecommendationsParams): Promise<MovieRecommendations> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.RECOMMENDATIONS}`;
		return this.client.request<MovieRecommendations>(endpoint, { language, ...rest });
	}

	/**
	 * Release Dates
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/release_dates
	 *
	 * Get the release dates and certifications for a movie. For different countries and release types.
	 * The release types and statuses used on TMDB are the following:
	 * - 1: Premiere
	 * - 2: Theatrical (Limited)
	 * - 3: Theatrical
	 * - 4: Digital
	 * - 5: Physical
	 * - 6: TV
	 * @param movie_id The ID of the movie.
	 * @returns A promise that resolves to the release dates for the movie.
	 * @reference https://developer.themoviedb.org/reference/movie-release-dates
	 */
	async release_dates(params: MovieReleaseDatesParams): Promise<MovieReleaseDates> {
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.RELEASE_DATES}`;
		return this.client.request<MovieReleaseDates>(endpoint);
	}

	/**
	 * Reviews
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/reviews
	 *
	 * Get the user reviews for a movie.
	 * @param movie_id The ID of the movie.
	 * @param page Page number of the results to return. Defaults to 1.
	 * @param language Language code to filter the results. Default is "en-US".
	 * @returns A promise that resolves to a paginated response of movies reviews.
	 * @reference https://developer.themoviedb.org/reference/movie-reviews
	 */
	async reviews(params: MovieReviewsParams): Promise<MovieReviews> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.REVIEWS}`;
		return this.client.request<MovieReviews>(endpoint, { language, ...rest });
	}

	/**
	 * Similar
	 * GET -https://api.themoviedb.org/3/movie/{movie_id}/similar
	 *
	 * Get the similar movies based on genres and keywords.
	 * This method only looks for other items based on genres and plot keywords.
	 * As such, the results found here are not always going to be 💯. Use it with that in mind.
	 * @param movie_id The ID of the movie
	 * @param page Page number of the results to return. Defaults to 1.
	 * @param language Language code to filter the results. Default is "en-US".
	 * @returns A promise that resolves to a paginated response of similar movies.
	 * @reference https://developer.themoviedb.org/reference/movie-similar
	 */
	async similar(params: MovieSimilarParams): Promise<MovieSimilar> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.SIMILAR}`;
		return this.client.request<MovieSimilar>(endpoint, { language, ...rest });
	}

	/**
	 * Translations
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/translations
	 *
	 * Get the translations for a movie.
	 * Take a read through our language documentation for more information about languages on TMDB.
	 * https://developer.themoviedb.org/docs/languages
	 * @param movie_id The ID of the movie
	 * @returns A promise that resolves to the translations of the movie.
	 * @reference https://developer.themoviedb.org/reference/movie-translations
	 */
	async translations(params: MovieTranslationsParams): Promise<MovieTranslations> {
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.TRANSLATIONS}`;
		return this.client.request<MovieTranslations>(endpoint);
	}

	/**
	 * Videos
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/videos
	 *
	 * Get the available videos for a movie.
	 * @param movie_id The ID of the movie
	 * @returns A promise that resolves to a list of videos for the movie.
	 * @reference https://developer.themoviedb.org/reference/movie-videos
	 */
	async videos(params: MovieVideosParams): Promise<MovieVideos> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.VIDEOS}`;
		return this.client.request<MovieVideos>(endpoint, { language, ...rest });
	}

	/**
	 * Watch Providers
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/watch/providers
	 *
	 * Get the list of streaming providers we have for a movie.
	 * Powered by our partnership with JustWatch, you can query this method to get a list of the streaming/rental/purchase availabilities per country by provider.
	 * This is not going to return full deep links, but rather, it's just enough information to display what's available where.
	 * You can link to the provided TMDB URL to help support TMDB and provide the actual deep links to the content.
	 *
	 * JustWatch ATTRIBUTION REQUIRED
	 * In order to use this data you must attribute the source of the data as JustWatch.
	 * If we find any usage not complying with these terms we will revoke access to the API.
	 * @param movie_id The ID of the movie
	 * @returns A promise that resolves to a list of videos for the movie.
	 * @reference https://developer.themoviedb.org/reference/movie-videos
	 */
	async watch_providers(params: MovieWatchProvidersParams): Promise<MovieWatchProvider> {
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${params.movie_id}${MOVIE_ENDPOINTS.WATCH_PROVIDERS}`;
		return this.client.request<MovieWatchProvider>(endpoint);
	}
}
