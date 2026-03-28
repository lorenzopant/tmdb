import { describe, expect, it } from "vitest";

import { TMDBError } from "../../errors/tmdb";

describe("TMDBError", () => {
	it("defaults tmdb_status_code to -1 when it is omitted", () => {
		const error = new TMDBError("Boom", 500);

		expect(error.name).toBe("TMDBError");
		expect(error.message).toBe("Boom");
		expect(error.http_status_code).toBe(500);
		expect(error.tmdb_status_code).toBe(-1);
	});

	it("preserves a provided tmdb_status_code", () => {
		const error = new TMDBError("Not found", 404, 34);

		expect(error.tmdb_status_code).toBe(34);
		expect(error.http_status_code).toBe(404);
	});
});
