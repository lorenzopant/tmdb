export type PagedResponse<T> = {
	page: number;
	total_pages: number;
	total_results: number;
	results: T[];
};
