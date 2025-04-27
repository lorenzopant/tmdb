import { ApiClient } from "../client";
import { MovieAlternativeTitles, MovieCredits, MovieDetails, MovieExternalIDs } from "../types/movies";

export const MOVIE_ENDPOINTS = {
	MOVIE: "/movie",
	ALTERNATIVE_TITLES: "/alternative_titles",
	CREDITS: "/credits",
	EXTERNAL_IDS: "/external_ids",
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
}
