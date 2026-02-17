import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../client";
import { TVSeriesAPI } from "../../endpoints/tv_series";
import { TVAppendToResponseNamespace } from "../../types/tv/tv_series";

describe("TVSeriesAPI", () => {
	let clientMock: ApiClient;
	let tvAPI: TVSeriesAPI;

	beforeEach(() => {
		clientMock = new ApiClient("valid_access_token");
		clientMock.request = vi.fn();
		tvAPI = new TVSeriesAPI(clientMock, { language: "en-US" });
	});

	it("should call client.request with the correct parameters", async () => {
		const series_id = 1396;
		const language = "it-IT";
		const append_to_response: TVAppendToResponseNamespace[] = ["credits", "external_ids"];

		await tvAPI.details({ series_id, language, append_to_response });
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/tv/1396", {
			series_id,
			append_to_response,
			language,
		});
	});

	it("should use default language when not provided", async () => {
		const series_id = 1396;
		await tvAPI.details({ series_id });
		expect(clientMock.request).toHaveBeenCalledOnce();
		expect(clientMock.request).toHaveBeenCalledWith("/tv/1396", {
			series_id,
			append_to_response: undefined,
			language: "en-US",
		});
	});

	it("should return the result from client.request", async () => {
		const fakeResponse = { id: 1396, name: "Breaking Bad" };
		(clientMock.request as ReturnType<typeof vi.fn>).mockResolvedValue(fakeResponse);
		const result = await tvAPI.details({ series_id: 1396 });
		expect(result).toEqual(fakeResponse);
	});
});
