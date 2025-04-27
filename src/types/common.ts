// src/types/common.ts

/**
 * Represents a genre of a movie or TV show.
 */
export type Genre = {
	// ** The unique identifier for the genre
	id: number;

	// ** The name of the genre
	name: string;
};

/**
 * Represents a production company involved in creating a movie or TV show.
 */
export type ProductionCompany = {
	// ** The unique identifier for the production company
	id: number;

	// ** The path to the logo of the production company, or null if not available
	logo_path: string | null;

	// ** The name of the production company
	name: string;

	// ** The country where the production company is based, represented by its ISO 3166-1 code
	origin_country: string;
};

/**
 * Represents a country where a movie or TV show was produced.
 */
export type ProductionCountry = {
	// ** The ISO 3166-1 code of the country
	iso_3166_1: string;

	// ** The name of the country
	name: string;
};

/**
 * Represents a spoken language in a movie or TV show.
 */
export type SpokenLanguage = {
	// ** The English name of the language
	english_name: string;

	// ** The ISO 639-1 code of the language
	iso_639_1: string;

	// ** The name of the language in its native form
	name: string;
};

/**
 * Represents a collection of movies.
 */
export type Collection = {
	// ** The unique identifier for the collection
	id: number;

	// ** The name of the collection
	name: string;

	// ** The path to the poster image of the collection, or null if not available
	poster_path: string | null;

	// ** The path to the backdrop image of the collection, or null if not available
	backdrop_path: string | null;
};

/**
 * Represents a cast member in a movie or TV show.
 */
export type Cast = {
	// ** Indicates whether the cast member is an adult
	adult: boolean;

	// ** The gender of the cast member, or null if not specified (1 = female, 2 = male)
	gender: number | null;

	// ** The unique identifier for the cast member
	id: number;

	// ** The department the cast member is known for
	known_for_department: string;

	// ** The name of the cast member
	name: string;

	// ** The original name of the cast member
	original_name: string;

	// ** The popularity score of the cast member
	popularity: number;

	// ** The path to the profile image of the cast member, or null if not available
	profile_path?: string | null;

	// ** The unique identifier for the cast credit
	cast_id: number;

	// ** The character played by the cast member
	character: string;

	// ** The unique identifier for the credit
	credit_id: string;

	// ** The order of the cast member in the credits
	order: number;
};

/**
 * Represents a crew member in a movie or TV show.
 */
export type Crew = {
	// ** Indicates whether the crew member is an adult
	adult: boolean;

	// ** The gender of the crew member, or null if not specified (1 = female, 2 = male)
	gender: number | null;

	// ** The unique identifier for the crew member
	id: number;

	// ** The department the crew member is known for
	known_for_department: string;

	// ** The name of the crew member
	name: string;

	// ** The original name of the crew member
	original_name: string;

	// ** The popularity score of the crew member
	popularity: number;

	// ** The path to the profile image of the crew member, or null if not available
	profile_path?: string | null;

	// ** The unique identifier for the credit
	credit_id: string;

	// ** The department the crew member worked in
	department: string;

	// ** The specific job performed by the crew member
	job: string;
};

export type Keyword = {
	// ** The unique identifier for the keyword
	id: number;

	// ** The name of the keyword
	name: string;
};
