import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "it-IT", region: "IT" });

describe("Certifications API", () => {
	it("(MOVIES) should fetch movie certifications list", async () => {
		const certs = await tmdb.certifications.movie_certifications();
		expect(certs.certifications).toBeDefined();
		expect(certs.certifications["US"]).toBeDefined();
	});

	it("(TV) should fetch movie certifications list", async () => {
		const certs = await tmdb.certifications.tv_certifications();
		expect(certs.certifications).toBeDefined();
		expect(certs.certifications["US"]).toBeDefined();
	});
});
