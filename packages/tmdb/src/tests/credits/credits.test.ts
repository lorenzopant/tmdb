import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { CreditsAPI } from "../../endpoints/credits";

describe("CreditsAPI", () => {
	let clientMock: ApiClient;
	let creditsAPI: CreditsAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		creditsAPI = new CreditsAPI(clientMock, { language: "en-US" });
	});

	it("should call client.request with the correct parameters", async () => {
		const credit_id = "52fe4250c3a36847f80149f3";
		const language = "it-IT";

		await creditsAPI.details({ credit_id, language });

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith(`/credit/${credit_id}`, {
			credit_id,
			language,
		});
	});

	it("should apply the default language when none is provided", async () => {
		const credit_id = "52fe4250c3a36847f80149f3";

		await creditsAPI.details({ credit_id });

		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith(`/credit/${credit_id}`, {
			credit_id,
			language: "en-US",
		});
	});

	it("should return the result from client.request", async () => {
		const fakeResponse = { id: "52fe4250c3a36847f80149f3", media_type: "movie" };
		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);

		const result = await creditsAPI.details({ credit_id: "52fe4250c3a36847f80149f3" });

		expect(result).toEqual(fakeResponse);
	});
});
