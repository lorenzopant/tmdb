/**
 * Represents the structure of an error response returned by the TMDB API.
 *
 * @property success - Always `false` for error responses.
 * @property failure - Present and `true` on some error responses (e.g. malformed body).
 * @property status_code - The numeric TMDB status code describing the error.
 * @property status_message - A descriptive message providing details about the error.
 * @property error - Optional internal error detail returned by TMDB (e.g. for malformed input).
 */
export type TMDBAPIErrorResponse = {
	success: boolean;
	/** Present and `true` when TMDB explicitly signals a failure (e.g. invalid body, status_code 47). */
	failure?: boolean;
	status_code: number;
	status_message: string;
	/** Internal TMDB error detail, present on some 4xx responses (e.g. TMDB status_code 47). */
	error?: string;
};

/**
 * Represents a generic error or an error specific to the TMDB (The Movie Database) API.
 * This error class extends the built-in `Error` class and includes additional
 * properties to provide more context about the error.
 */
export class TMDBError extends Error {
	/**
	 * The status code returned by the TMDB API.
	 * If the value is `-1`, it indicates a library-specific error rather than a TMDB API error.
	 * @reference https://developer.themoviedb.org/docs/errors - code
	 */
	public tmdb_status_code: number;

	/**
	 * A descriptive message providing details about the error.
	 * If the error is specific to the TMDB API, this message will be derived from the API response
	 * @reference https://developer.themoviedb.org/docs/errors - message
	 */
	public message: string;

	/**
	 * The HTTP status code associated with the error.
	 * If the error is specific to the TMDB API, this code will be derived from the API response.
	 * @reference https://developer.themoviedb.org/docs/errors - HTTP Status
	 */
	public http_status_code: number;

	/**
	 * Creates an instance of `TMDBError`.
	 *
	 * @param message - A descriptive message providing details about the error.
	 * @param http_status - The HTTP status code associated with the error.
	 * @param tmdb_status_code - (Optional) The status code returned by the TMDB API. Defaults to `-1` for library-specific errors.
	 */
	constructor(message: string, http_status: number, tmdb_status_code?: number) {
		super(message);
		this.name = "TMDBError";
		this.tmdb_status_code = tmdb_status_code || -1;
		this.message = message;
		this.http_status_code = http_status;
	}
}
