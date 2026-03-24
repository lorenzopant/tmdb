import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { CertificationsAPI } from "../../endpoints/certifications";

const token = process.env.TMDB_BEARER_TOKEN;
if (!token) throw new Error("TMDB_BEARER_TOKEN is not set, please set it in your enviroment variables.");
describe("CertificationsAPI", () => {
	let clientMock: ApiClient;
	let certificationsAPI: CertificationsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		certificationsAPI = new CertificationsAPI(clientMock);
	});

	it("should call client.request with the correct endpoint for movie certifications", async () => {
		await certificationsAPI.movie_certifications();
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/certification/movie/list");
	});

	it("should call client.request with the correct endpoint for tv certifications", async () => {
		await certificationsAPI.tv_certifications();
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/certification/tv/list");
	});

	it("should return the result from client.request for movie certifications", async () => {
		const fakeResponse = { certifications: { US: [] } };
		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
		const result = await certificationsAPI.movie_certifications();
		expect(result).toEqual(fakeResponse);
	});

	it("should return the result from client.request for tv certifications", async () => {
		const fakeResponse = { certifications: { US: [] } };
		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
		const result = await certificationsAPI.tv_certifications();
		expect(result).toEqual(fakeResponse);
	});
});
