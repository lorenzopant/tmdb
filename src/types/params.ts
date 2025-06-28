export type PaginatedResponse<T> = {
	page: number;
	total_pages: number;
	total_results: number;
	results: T[];
};

export type SearchMoviesParams = {
	query: string;
	include_adult?: boolean;
	language?: string;
	page?: number;
	primary_release_year?: string;
	region?: string;
	year?: string;
};
