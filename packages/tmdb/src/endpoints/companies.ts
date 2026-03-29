import { ENDPOINTS } from "../routes";
import {
	Company,
	CompanyAlternativeNames,
	CompanyAlternativeNamesParams,
	CompanyImages,
	CompanyImagesParams,
	CompanyDetailsParams,
} from "../types/companies";
import { TMDBAPIBase } from "./base";

export class CompaniesAPI extends TMDBAPIBase {
	private companyPath(company_id: number): string {
		return `${ENDPOINTS.COMPANIES.DETAILS}/${company_id}`;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/company/{company_id}
	 *
	 * Get the company details by ID.
	 *
	 * @param company_id Unique identifier for the company
	 * @reference https://developer.themoviedb.org/reference/company-details
	 */
	async details(params: CompanyDetailsParams): Promise<Company> {
		const endpoint = this.companyPath(params.company_id);
		return this.client.request<Company>(endpoint);
	}

	/**
	 * Alternative names
	 * GET - https://api.themoviedb.org/3/company/{company_id}/alternative_names
	 *
	 * Get the list of alternative names for a company.
	 *
	 * @param company_id Unique identifier for the company
	 * @reference https://developer.themoviedb.org/reference/company-alternative-names
	 */
	async alternative_names(params: CompanyAlternativeNamesParams): Promise<CompanyAlternativeNames> {
		const endpoint = `${this.companyPath(params.company_id)}${ENDPOINTS.COMPANIES.ALTERNATIVE_NAMES}`;
		return this.client.request<CompanyAlternativeNames>(endpoint);
	}

	/**
	 * Images
	 * GET - https://api.themoviedb.org/3/company/{company_id}/images
	 *
	 * Get the logos for a company by ID.
	 *
	 * @param company_id Unique identifier for the company
	 * @param language Language for the response
	 * @param include_image_language Additional language for images
	 * @reference https://developer.themoviedb.org/reference/company-images
	 */
	async images(params: CompanyImagesParams): Promise<CompanyImages> {
		const { company_id, ...rest } = params;
		const endpoint = `${this.companyPath(company_id)}${ENDPOINTS.COMPANIES.IMAGES}`;
		return this.client.request<CompanyImages>(endpoint, this.withLanguage(rest));
	}
}
