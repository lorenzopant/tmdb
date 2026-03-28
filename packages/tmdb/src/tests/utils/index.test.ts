import { describe, expect, it } from "vitest";

import * as utils from "../../utils";

describe("utils barrel exports", () => {
	it("re-exports jwt and logger utilities", () => {
		expect(typeof utils.isJwt).toBe("function");
		expect(typeof utils.TMDBLogger).toBe("function");
	});
});
