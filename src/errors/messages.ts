/**
 * A collection of error messages used throughout the application.
 * For library-specific errors (-1 status code) only.
 */
export const Errors = {
	NO_ACCESS_TOKEN: "TMDB requires a valid access token, please provide one.",
};

/**
 * TMDB Error Codes and messages.
 * @reference https://developer.themoviedb.org/docs/errors
 */
export const TMDB_ERRORS: Map<number, { message: string; http_status: number }> = new Map([
	[1, { message: "Success", http_status: 200 }],
	[2, { message: "Invalid service: this service does not exist.", http_status: 501 }],
	[3, { message: "Authentication failed: You do not have permissions to access the service.", http_status: 401 }],
	[4, { message: "Invalid format: This service doesn't exist in that format.", http_status: 405 }],
	[5, { message: "Invalid parameters: Your request parameters are incorrect.", http_status: 422 }],
	[6, { message: "Invalid id: The pre-requisite id is invalid or not found.", http_status: 404 }],
	[7, { message: "Invalid API key: You must be granted a valid key.", http_status: 401 }],
	[8, { message: "Duplicate entry: The data you tried to submit already exists.", http_status: 403 }],
	[9, { message: "Service offline: This service is temporarily offline, try again later.", http_status: 503 }],
	[10, { message: "Suspended API key: Access to your account has been suspended, contact TMDB.", http_status: 401 }],
	[11, { message: "Internal error: Something went wrong, contact TMDB.", http_status: 500 }],
	[12, { message: "The item/record was updated successfully.", http_status: 201 }],
	[13, { message: "The item/record was deleted successfully.", http_status: 200 }],
	[14, { message: "Authentication failed.", http_status: 401 }],
	[15, { message: "Failed", http_status: 500 }],
	[16, { message: "Device denied.", http_status: 401 }],
	[17, { message: "Session denied.", http_status: 401 }],
	[18, { message: "Validation failed.", http_status: 400 }],
	[19, { message: "Invalid accept header.", http_status: 406 }],
	[20, { message: "Invalid date range: Should be a range no longer than 14 days.", http_status: 422 }],
	[21, { message: "Entry not found: The item you are trying to edit cannot be found.", http_status: 200 }],
	[
		22,
		{
			message: "Invalid page: Pages start at 1 and max at 500. They are expected to be an integer.",
			http_status: 400,
		},
	],
	[23, { message: "Invalid date: Format needs to be YYYY-MM-DD.", http_status: 400 }],
	[24, { message: "Your request to the backend server timed out. Try again.", http_status: 504 }],
	[25, { message: "Your request count (#) is over the allowed limit of (40).", http_status: 429 }],
	[26, { message: "You must provide a username and password.", http_status: 400 }],
	[27, { message: "Too many append to response objects: The maximum number of remote calls is 20.", http_status: 400 }],
	[28, { message: "Invalid timezone: Please consult the documentation for a valid timezone.", http_status: 400 }],
	[29, { message: "Invalid date range: Should be a range no longer than 14 days.", http_status: 422 }],
	[30, { message: "Invalid date range: Should be a range no longer than 14 days.", http_status: 422 }],
	[31, { message: "Invalid date range: Should be a range no longer than 14 days.", http_status: 422 }],
	[32, { message: "Invalid date range: Should be a range no longer than 14 days.", http_status: 422 }],
	[33, { message: "Invalid date range: Should be a range no longer than 14 days.", http_status: 422 }],
	[34, { message: "The resource you requested could not be found.", http_status: 404 }],
]);
