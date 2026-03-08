/**
 * Supported sort options for the movie discover endpoint.
 * @reference https://developer.themoviedb.org/reference/discover-movie
 */
export type DiscoverMovieSortBy =
	| "original_title.asc"
	| "original_title.desc"
	| "popularity.asc"
	| "popularity.desc"
	| "revenue.asc"
	| "revenue.desc"
	| "primary_release_date.asc"
	| "primary_release_date.desc"
	| "title.asc"
	| "title.desc"
	| "vote_average.asc"
	| "vote_average.desc"
	| "vote_count.asc"
	| "vote_count.desc";
