// MARK: Validate Key

/** Response from GET /authentication — confirms the access token is valid. */
export type AuthValidateKeyResponse = {
	/** Always `true` on success. */
	success: boolean;
	/** TMDB internal status code (1 = success). */
	status_code: number;
	/** Human-readable status message. */
	status_message: string;
};

// MARK: Guest Session

/**
 * Response from GET /authentication/guest_session/new.
 * Contains a short-lived guest session ID and its expiry timestamp.
 */
export type AuthGuestSessionResponse = {
	/** Always `true` on success. */
	success: boolean;
	/** The generated guest session ID. Treat this like a password — keep it private. */
	guest_session_id: string;
	/** Expiry timestamp for the guest session (UTC string). Auto-expires after 60 minutes of inactivity. */
	expires_at: string;
};

// MARK: Request Token

/**
 * Response from GET /authentication/token/new and POST /authentication/token/validate_with_login.
 * Contains a short-lived request token and its expiry timestamp.
 */
export type AuthRequestTokenResponse = {
	/** Always `true` on success. */
	success: boolean;
	/** Expiry timestamp for the request token (UTC string). Auto-expires after 60 minutes if unused. */
	expires_at: string;
	/** The generated request token. Used to build the TMDB authorization URL or as input to `create_session`. */
	request_token: string;
};

// MARK: Create Session

/** Request body for POST /authentication/session/new. */
export type AuthCreateSessionBody = {
	/** An approved request token from `create_request_token` (after the user has authorized it on TMDB). */
	request_token: string;
};

/** Response from POST /authentication/session/new. */
export type AuthCreateSessionResponse = {
	/** Always `true` on success. */
	success: boolean;
	/** The created session ID. Treat this like a password — keep it private. Valid indefinitely until deleted. */
	session_id: string;
};

// MARK: Create Session With Login

/** Request body for POST /authentication/token/validate_with_login. */
export type AuthCreateSessionWithLoginBody = {
	/** The TMDB account username. */
	username: string;
	/** The TMDB account password. */
	password: string;
	/** The request token obtained from `create_request_token`. */
	request_token: string;
};

// MARK: Delete Session

/** Request body for DELETE /authentication/session. */
export type AuthDeleteSessionBody = {
	/** The session ID to invalidate. */
	session_id: string;
};

/** Response from DELETE /authentication/session. */
export type AuthDeleteSessionResponse = {
	/** `true` if the session was successfully deleted. */
	success: boolean;
};
