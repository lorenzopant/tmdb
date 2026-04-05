import { ENDPOINTS_V4 } from "../../routes";
import { TMDBAPIBase } from "../base";
import type {
	V4AuthCreateAccessTokenBody,
	V4AuthCreateRequestTokenBody,
	V4AuthAccessTokenResponse,
	V4AuthDeleteAccessTokenBody,
	V4AuthDeleteAccessTokenResponse,
	V4AuthRequestTokenResponse,
} from "../../types/v4/auth";

export class V4AuthAPI extends TMDBAPIBase {
	/**
	 * Create Request Token
	 * POST - https://api.themoviedb.org/4/auth/request_token
	 *
	 * Generate a request token that the user must approve at the TMDB website to begin
	 * the v4 OAuth-style flow. Redirect the user to:
	 * `https://www.themoviedb.org/auth/access?request_token={request_token}`
	 *
	 * Once approved, exchange the token for an access token using `create_access_token`.
	 * @param body Optional body with a `redirect_to` URL for post-approval redirect.
	 * @reference https://developer.themoviedb.org/reference/create-request-token
	 */
	async create_request_token(body?: V4AuthCreateRequestTokenBody): Promise<V4AuthRequestTokenResponse> {
		return this.client.mutate<V4AuthRequestTokenResponse>("POST", ENDPOINTS_V4.AUTH.REQUEST_TOKEN, body ?? {});
	}

	/**
	 * Create Access Token
	 * POST - https://api.themoviedb.org/4/auth/access_token
	 *
	 * Exchange a user-approved request token for a permanent user access token and
	 * TMDB account ID. Store the returned `access_token` securely — it is valid
	 * indefinitely until explicitly deleted with `delete_access_token`.
	 * @param body An object containing the approved `request_token`.
	 * @reference https://developer.themoviedb.org/reference/create-access-token
	 */
	async create_access_token(body: V4AuthCreateAccessTokenBody): Promise<V4AuthAccessTokenResponse> {
		return this.client.mutate<V4AuthAccessTokenResponse>("POST", ENDPOINTS_V4.AUTH.ACCESS_TOKEN, body);
	}

	/**
	 * Delete Access Token (Logout)
	 * DELETE - https://api.themoviedb.org/4/auth/access_token
	 *
	 * Invalidate a user access token. Use this to log a user out of your application.
	 * @param body An object containing the `access_token` to delete.
	 * @reference https://developer.themoviedb.org/reference/delete-access-token
	 */
	async delete_access_token(body: V4AuthDeleteAccessTokenBody): Promise<V4AuthDeleteAccessTokenResponse> {
		return this.client.mutate<V4AuthDeleteAccessTokenResponse>("DELETE", ENDPOINTS_V4.AUTH.ACCESS_TOKEN, body);
	}
}
