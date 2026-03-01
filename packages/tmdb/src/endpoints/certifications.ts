import { ENDPOINTS } from "../routes";
import { Certifications } from "../types";
import { TMDBAPIBase } from "./base";

export class CertificationsAPI extends TMDBAPIBase {
	/**
	 * Movie Certifications
	 * GET - https://api.themoviedb.org/3/certification/movie/list
	 *
	 * Get an up to date list of the officially supported movie certifications on TMDB.
	 * @reference https://developer.themoviedb.org/reference/certification-movie-list
	 */
	async movie_certifications(): Promise<Certifications> {
		return this.client.request<Certifications>(ENDPOINTS.CERTIFICATIONS.MOVIE_CERTIFICATIONS);
	}

	/**
	 * TV Certifications
	 * GET - https://api.themoviedb.org/3/certification/tv/list
	 *
	 * Get an up to date list of the officially supported tv certifications on TMDB.
	 * @reference https://developer.themoviedb.org/reference/certification-tv-list
	 */
	async tv_certifications(): Promise<Certifications> {
		return this.client.request<Certifications>(ENDPOINTS.CERTIFICATIONS.TV_CERTIFICATIONS);
	}
}
