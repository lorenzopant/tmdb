/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_ACCESS_TOKEN;
if (!token) throw new Error("TMDB_ACCESS_TOKEN is not set, plaase set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "en-US", region: "US" });
const companyId = 174;

describe("Companies API", () => {
	it("(DETAILS) should fetch company details", async () => {
		const company = await tmdb.companies.details({ company_id: companyId });

		expect(company.id).toBe(companyId);
		expect(company.name).toBe("Warner Bros. Pictures");
		expect(company.origin_country).toBe("US");
	});

	it("(ALTERNATIVE NAMES) should fetch company alternative names", async () => {
		const company = await tmdb.companies.alternativeNames({ company_id: companyId });

		expect(company.id).toBe(companyId);
		expect(Array.isArray(company.results)).toBe(true);
	});

	it("(IMAGES) should fetch company images", async () => {
		const company = await tmdb.companies.images({ company_id: companyId, language: "en-US" });

		expect(company.id).toBe(companyId);
		expect(Array.isArray(company.logos)).toBe(true);
		if (company.logos.length > 0) {
			expect(company.logos[0].file_path).toBeDefined();
		}
	});
});
