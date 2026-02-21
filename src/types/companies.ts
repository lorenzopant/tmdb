import { CountryISO3166_1 } from "./config/countries";

export type SearchCompanyItem = {
	id: number;
	logo_path: string;
	name: string;
	origin_country: CountryISO3166_1;
};
