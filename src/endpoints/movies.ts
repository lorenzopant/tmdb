import { ApiClient } from "../client";
import { Changes } from "../types/common";
import {
	MovieAlternativeTitles,
	MovieCredits,
	MovieDetails,
	MovieExternalIDs,
	MovieImages,
	MovieKeywords,
	MovieResultItem,
} from "../types/movies";
import { PagedResponse } from "../types/params";

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
	REVIEWS: "/reviews",
	SIMILAR: "/similar",
	TRANSLATIONS: "/translations",
	VIDEOS: "/videos",
	WATCH_PROVIDERS: "/watch/providers",
};

export class MoviesAPI {
	private client: ApiClient;

	constructor(client: ApiClient) {
		this.client = client;
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
	async details(movie_id: number, append_to_response?: string[], language?: string): Promise<MovieDetails> {
		const params: Record<string, string | string[] | undefined> = { append_to_response, language };
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${movie_id}`;
		return this.client.request<MovieDetails>(endpoint, params);
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
	async alternative_titles(movie_id: number, country?: string): Promise<MovieAlternativeTitles> {
		const params: Record<string, string | undefined> = { country: country || "" };
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${movie_id}${MOVIE_ENDPOINTS.ALTERNATIVE_TITLES}`;
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
	async credits(movie_id: number, language: string = "en-US"): Promise<MovieCredits> {
		const params: Record<string, string | undefined> = { language };
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${movie_id}${MOVIE_ENDPOINTS.CREDITS}`;
		return this.client.request<MovieCredits>(endpoint, params);
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
	async external_ids(movie_id: number): Promise<MovieExternalIDs> {
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${movie_id}${MOVIE_ENDPOINTS.EXTERNAL_IDS}`;
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
	async keywords(movie_id: number): Promise<MovieKeywords> {
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${movie_id}${MOVIE_ENDPOINTS.KEYWORDS}`;
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
	async changes(movie_id: number, page?: number, start_date?: string, end_date?: string): Promise<Changes> {
		const params: Record<string, string | number | undefined> = { page, start_date, end_date };
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${movie_id}${MOVIE_ENDPOINTS.CHANGES}`;
		return this.client.request<Changes>(endpoint, params);
	}

	/**
	 * Images
	 * GET - https://api.themoviedb.org/3/movie/{movie_id}/images
	 *
	 * Fetches images related to a specific movie, such as posters and backdrops.
	 * The images are returned in various sizes and formats.
	 * @param movie_id - The unique identifier of the movie.
	 * @param language - (Optional) The language code to filter the images by language.
	 * @param include_image_language - (Optional) A comma-separated list of language codes to include images for.
	 * @returns A promise that resolves to a `MovieImages` object containing the movie's images.
	 * @reference https://developer.themoviedb.org/reference/movie-images
	 */
	async images(movie_id: number, language?: string, include_image_language?: string): Promise<MovieImages> {
		const params: Record<string, string | undefined> = { language, include_image_language };
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${movie_id}${MOVIE_ENDPOINTS.IMAGES}`;
		return this.client.request<MovieImages>(endpoint, params);
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
	async recommendations(movie_id: number, page?: number, language?: string): Promise<PagedResponse<MovieResultItem>> {
		const params: Record<string, string | number | undefined> = { page, language };
		const endpoint = `${MOVIE_ENDPOINTS.MOVIE}/${movie_id}${MOVIE_ENDPOINTS.RECOMMENDATIONS}`;
		return this.client.request<PagedResponse<MovieResultItem>>(endpoint, params);
	}
}
