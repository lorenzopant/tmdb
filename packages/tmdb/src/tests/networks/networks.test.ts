/// <reference types="node" />
import { describe, expect, it } from "vitest";

import { TMDB } from "../../tmdb";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");

const tmdb = new TMDB(token, { language: "en-US", region: "US" });
const networkId = 1;

describe("Networks API", () => {
	it("(DETAILS) should fetch network details", async () => {
		const network = await tmdb.networks.details({ network_id: networkId });

		expect(network.id).toBe(networkId);
		expect(network.name).toBeDefined();
		expect(typeof network.name).toBe("string");
		expect(network.name.length).toBeGreaterThan(0);
		expect(network).toHaveProperty("origin_country");
	});

	it("(ALTERNATIVE NAMES) should fetch network alternative names", async () => {
		const network = await tmdb.networks.alternative_names({ network_id: networkId });

		expect(network.id).toBe(networkId);
		expect(Array.isArray(network.results)).toBe(true);
	});

	it("(IMAGES) should fetch network images", async () => {
		const network = await tmdb.networks.images({ network_id: networkId });

		expect(network.id).toBe(networkId);
		expect(Array.isArray(network.logos)).toBe(true);
		if (network.logos.length > 0) {
			expect(network.logos[0].file_path).toBeDefined();
		}
	});
});
