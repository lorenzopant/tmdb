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
 * Represents common class for cast and crew types
 */
export type Credit = {
	// ** Indicates whether the cast member is an adult
	adult: boolean;

	// ** The gender of the cast member, or null if not specified (1 = female, 2 = male)
	gender: number | null;

	// ** The unique identifier for the crew/cast member
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

	// ** The unique identifier for the credit
	credit_id: string;
};

/**
 * Represents a cast member in a movie or TV show.
 */
export type Cast = Credit & {
	// ** The unique identifier for the cast credit
	cast_id: number;

	// ** The character played by the cast member
	character: string;

	// ** The order of the cast member in the credits
	order: number;
};

/**
 * Represents a crew member in a movie or TV show.
 */
export type Crew = Credit & {
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

export type Changes = {
	changes: Change[];
};

export type Change = {
	key: string;
	items: ChangeItem[];
};

export type ChangeItem = {
	id: number;
	action: string;
	time: string;
	iso_639_1: string;
	iso_3166_1: string;
	value: object;
};

export type ImageItem = {
	aspect_ratio: number;
	height: number;
	iso_639_1: string | null;
	file_path: string;
	vote_average: number;
	vote_count: number;
	width: number;
};

export type VideoItem = {
	iso_649_1: string;
	iso_3166_1: string;
	name: string;
	key: string;
	site: string;
	size: number;
	type: string;
	official: boolean;
	published_at: string;
	id: string;
};
