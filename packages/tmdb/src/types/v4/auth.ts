// MARK: Create Request Token

/** Optional request body for POST /4/auth/request_token. */
export type V4AuthCreateRequestTokenBody = {
	/** URL to redirect the user back to after they approve the request token on TMDB. */
	redirect_to?: string;
};

/**
 * Response from POST /4/auth/request_token.
 * Contains a short-lived request token the user must approve at the TMDB website.
 */
export type V4AuthRequestTokenResponse = {
	/** Always `true` on success. */
	success: boolean;
	/** The generated request token. Redirect the user to:
	 * `https://www.themoviedb.org/auth/access?request_token={request_token}` to approve it. */
	request_token: string;
};

// MARK: Create Access Token

/** Request body for POST /4/auth/access_token. */
export type V4AuthCreateAccessTokenBody = {
	/** The request token that the user has approved at the TMDB website. */
	request_token: string;
};

/**
 * Response from POST /4/auth/access_token.
 * Contains the permanent user access token and the TMDB account ID.
 */
export type V4AuthAccessTokenResponse = {
	/** Always `true` on success. */
	success: boolean;
	/** The permanent user access token (Bearer token). Store this securely — treat it like a password. */
	access_token: string;
	/** The TMDB account ID associated with this access token. Used by v4 account endpoints. */
	account_id: string;
};

// MARK: Delete Access Token

/** Request body for DELETE /4/auth/access_token. */
export type V4AuthDeleteAccessTokenBody = {
	/** The access token to invalidate. */
	access_token: string;
};

/**
 * Response from DELETE /4/auth/access_token.
 */
export type V4AuthDeleteAccessTokenResponse = {
	/** `true` if the access token was successfully deleted. */
	success: boolean;
	/** TMDB internal status code. */
	status_code: number;
	/** Human-readable status message. */
	status_message: string;
};
