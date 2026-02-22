import { WithLanguage } from "../types";
import { GenresResponse } from "../types/common/media";
import { TMDBAPIBase } from "./base";

export const GENRES_ENDPOINTS = {
	MOVIE_LIST: "/genre/movie/list",
	TV_LIST: "/genre/tv/list",
};

export class GenresAPI extends TMDBAPIBase {
	/**
	 * Movie List
	 * GET - https://api.themoviedb.org/3/genre/movie/list
	 *
	 * Get the list of official genres for movies.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the genres list.
	 * @reference https://developer.themoviedb.org/reference/genre-movie-list
	 */
	async movie_list(params?: WithLanguage): Promise<GenresResponse> {
		return this.client.request<GenresResponse>(GENRES_ENDPOINTS.MOVIE_LIST, this.withLanguage(params));
	}

	/**
	 * TV List
	 * GET - https://api.themoviedb.org/3/genre/tv/list
	 *
	 * Get the list of official genres for TV shows.
	 * @param language The language to use for the response.
	 * @returns A promise that resolves to the genres list.
	 * @reference https://developer.themoviedb.org/reference/genre-tv-list
	 */
	async tv_list(params?: WithLanguage): Promise<GenresResponse> {
		return this.client.request<GenresResponse>(GENRES_ENDPOINTS.TV_LIST, this.withLanguage(params));
	}
}
