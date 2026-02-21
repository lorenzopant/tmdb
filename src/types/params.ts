import { CountryISO3166_1 } from "./config/countries";
import { Language } from "./config/languages";

export type TMDBCommonParams = {
	language?: Language;
	region?: CountryISO3166_1;
};
