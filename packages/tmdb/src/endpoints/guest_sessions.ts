import { ENDPOINTS } from "../routes";
import type {
	GuestSessionRatedEpisodesResponse,
	GuestSessionRatedMoviesResponse,
	GuestSessionRatedParams,
	GuestSessionRatedTVResponse,
} from "../types/guest_sessions";
import { TMDBAPIBase } from "./base";

export class GuestSessionsAPI extends TMDBAPIBase {
	private guestSessionPath(guest_session_id: string): string {
		return `${ENDPOINTS.GUEST_SESSIONS.DETAILS}/${guest_session_id}`;
	}

	private guestSessionSubPath(guest_session_id: string, route: string): string {
		return `${this.guestSessionPath(guest_session_id)}${route}`;
	}

	/**
	 * Rated Movies
	 * GET - https://api.themoviedb.org/3/guest_session/{guest_session_id}/rated/movies
	 *
	 * Get the rated movies for a guest session.
	 * @param params Guest session ID, optional language, page, and sort_by.
	 * @reference https://developer.themoviedb.org/reference/guest-session-rated-movies
	 */
	async rated_movies(params: GuestSessionRatedParams): Promise<GuestSessionRatedMoviesResponse> {
		const { guest_session_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<GuestSessionRatedMoviesResponse>(
			this.guestSessionSubPath(guest_session_id, ENDPOINTS.GUEST_SESSIONS.RATED_MOVIES),
			{ language, ...rest },
		);
	}

	/**
	 * Rated TV
	 * GET - https://api.themoviedb.org/3/guest_session/{guest_session_id}/rated/tv
	 *
	 * Get the rated TV shows for a guest session.
	 * @param params Guest session ID, optional language, page, and sort_by.
	 * @reference https://developer.themoviedb.org/reference/guest-session-rated-tv
	 */
	async rated_tv(params: GuestSessionRatedParams): Promise<GuestSessionRatedTVResponse> {
		const { guest_session_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<GuestSessionRatedTVResponse>(
			this.guestSessionSubPath(guest_session_id, ENDPOINTS.GUEST_SESSIONS.RATED_TV),
			{ language, ...rest },
		);
	}

	/**
	 * Rated TV Episodes
	 * GET - https://api.themoviedb.org/3/guest_session/{guest_session_id}/rated/tv/episodes
	 *
	 * Get the rated TV episodes for a guest session.
	 * @param params Guest session ID, optional language, page, and sort_by.
	 * @reference https://developer.themoviedb.org/reference/guest-session-rated-tv-episodes
	 */
	async rated_tv_episodes(params: GuestSessionRatedParams): Promise<GuestSessionRatedEpisodesResponse> {
		const { guest_session_id, language = this.defaultOptions.language, ...rest } = params;
		return this.client.request<GuestSessionRatedEpisodesResponse>(
			this.guestSessionSubPath(guest_session_id, ENDPOINTS.GUEST_SESSIONS.RATED_TV_EPISODES),
			{ language, ...rest },
		);
	}
}
