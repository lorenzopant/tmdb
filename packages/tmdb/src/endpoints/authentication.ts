import { ENDPOINTS } from "../routes";
import { TMDBAPIBase } from "./base";
import type {
	AuthCreateSessionBody,
	AuthCreateSessionResponse,
	AuthCreateSessionWithLoginBody,
	AuthDeleteSessionBody,
	AuthDeleteSessionResponse,
	AuthGuestSessionResponse,
	AuthRequestTokenResponse,
	AuthValidateKeyResponse,
} from "../types/authentication";

export class AuthenticationAPI extends TMDBAPIBase {
	/**
	 * Validate Key
	 * GET - https://api.themoviedb.org/3/authentication
	 *
	 * Test your API key or Bearer token to confirm it is valid.
	 * Returns a success flag along with a TMDB status code and message.
	 * @reference https://developer.themoviedb.org/reference/authentication-validate-key
	 */
	async validate_key(): Promise<AuthValidateKeyResponse> {
		return this.client.request<AuthValidateKeyResponse>(ENDPOINTS.AUTHENTICATION.VALIDATE);
	}

	/**
	 * Create Guest Session
	 * GET - https://api.themoviedb.org/3/authentication/guest_session/new
	 *
	 * Create a temporary guest session that allows limited account actions
	 * (rating movies, TV shows and episodes) without a registered TMDB account.
	 * Guest sessions automatically expire after 60 minutes of inactivity.
	 * @reference https://developer.themoviedb.org/reference/authentication-create-guest-session
	 */
	async create_guest_session(): Promise<AuthGuestSessionResponse> {
		return this.client.request<AuthGuestSessionResponse>(ENDPOINTS.AUTHENTICATION.GUEST_SESSION);
	}

	/**
	 * Create Request Token
	 * GET - https://api.themoviedb.org/3/authentication/token/new
	 *
	 * Generate a short-lived request token (step 1 of the v3 session flow).
	 * The token expires after 60 minutes if not used. Direct the user to:
	 * `https://www.themoviedb.org/authenticate/{request_token}`
	 * to approve it, then exchange it for a session via `create_session`.
	 * @reference https://developer.themoviedb.org/reference/authentication-create-request-token
	 */
	async create_request_token(): Promise<AuthRequestTokenResponse> {
		return this.client.request<AuthRequestTokenResponse>(ENDPOINTS.AUTHENTICATION.REQUEST_TOKEN);
	}

	/**
	 * Create Session
	 * POST - https://api.themoviedb.org/3/authentication/session/new
	 *
	 * Exchange a user-approved request token for a permanent session ID (step 3 of the v3 session flow).
	 * The request token must have been approved by the user either via the TMDB website
	 * or via `create_session_with_login`. The returned `session_id` is valid indefinitely
	 * until explicitly deleted with `delete_session`.
	 * @param body An object containing the approved `request_token`.
	 * @reference https://developer.themoviedb.org/reference/authentication-create-session
	 */
	async create_session(body: AuthCreateSessionBody): Promise<AuthCreateSessionResponse> {
		return this.client.mutate<AuthCreateSessionResponse>("POST", ENDPOINTS.AUTHENTICATION.CREATE_SESSION, body);
	}

	/**
	 * Create Session With Login
	 * POST - https://api.themoviedb.org/3/authentication/token/validate_with_login
	 *
	 * Validate a request token using TMDB username and password credentials directly,
	 * as an alternative to the browser-redirect flow (step 2 of the v3 session flow).
	 * Use this for server-side apps or environments without web view access.
	 * The returned (validated) `request_token` must then be passed to `create_session`.
	 *
	 * **Important:** Only use this over HTTPS. Prefer the browser-redirect flow when possible.
	 * @param body Username, password, and the request token to validate.
	 * @reference https://developer.themoviedb.org/reference/authentication-create-session-from-login
	 */
	async create_session_with_login(body: AuthCreateSessionWithLoginBody): Promise<AuthRequestTokenResponse> {
		return this.client.mutate<AuthRequestTokenResponse>("POST", ENDPOINTS.AUTHENTICATION.CREATE_SESSION_WITH_LOGIN, body);
	}

	/**
	 * Delete Session
	 * DELETE - https://api.themoviedb.org/3/authentication/session
	 *
	 * Invalidate an existing session ID. Use this to log a user out of your application.
	 * @param body An object containing the `session_id` to delete.
	 * @reference https://developer.themoviedb.org/reference/authentication-delete-session
	 */
	async delete_session(body: AuthDeleteSessionBody): Promise<AuthDeleteSessionResponse> {
		return this.client.mutate<AuthDeleteSessionResponse>("DELETE", ENDPOINTS.AUTHENTICATION.DELETE_SESSION, body);
	}
}
