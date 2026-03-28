import { ENDPOINTS } from "../routes";
import { CreditDetails, CreditDetailsParams } from "../types/credits";
import { TMDBAPIBase } from "./base";

export class CreditsAPI extends TMDBAPIBase {
	private creditPath(credit_id: string): string {
		return `${ENDPOINTS.CREDITS.DETAILS}/${credit_id}`;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/credit/{credit_id}
	 *
	 * Get the detailed information for a movie or TV credit.
	 *
	 * @param credit_id Unique identifier for the credit
	 * @param language Language for the response
	 * @reference https://developer.themoviedb.org/reference/credit-details
	 */
	async details(params: CreditDetailsParams): Promise<CreditDetails> {
		const endpoint = this.creditPath(params.credit_id);
		const requestParams = this.withLanguage(params);
		return this.client.request<CreditDetails>(endpoint, requestParams);
	}
}
