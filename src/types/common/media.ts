// src/types/common/media.ts

import { CountryISO3166_1 } from "../config/countries";

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
 * Response containing available genres
 */
export type GenresResponse = {
	/** Array of genre objects with ID and name */
	genres: Genre[];
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

/**
 * Represents a keyword entry
 */
export type Keyword = {
	// ** The unique identifier for the keyword
	id: number;
	// ** The name of the keyword
	name: string;
};

/**
 *  Alternative title entry
 */
export type AlternativeTitle = {
	/** Alternative title text */
	title: string;
	/** ISO 3166-1 country code where this title is used */
	iso_3166_1: string;
	/** Type of title (e.g., "original title", "working title") */
	type: string;
};

/**
 * Video metadata and details
 */
export type VideoItem = {
	/** ISO 639-1 language code of the video */
	iso_649_1: string;
	/** ISO 3166-1 country code where the video is available */
	iso_3166_1: string;
	/** Video title or name */
	name: string;
	/** Unique video key/ID on the hosting platform */
	key: string;
	/** Video hosting platform (e.g., "YouTube", "Vimeo") */
	site: string;
	/** Video resolution/size (e.g., 1080, 720) */
	size: number;
	/** Type of video (e.g., "Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes") */
	type: string;
	/** Whether this is an official video from the content distributor */
	official: boolean;
	/** Publication date and time (ISO 8601 format) */
	published_at: string;
	/** Unique video identifier in TMDB */
	id: string;
};

/**
 * Image metadata and details
 */
export type ImageItem = {
	/** Aspect ratio of the image (width/height) */
	aspect_ratio: number;
	/** Image height in pixels */
	height: number;
	/** ISO 639-1 language code if image contains text, null otherwise */
	iso_639_1: string | null;
	/** Relative path to the image file (append to base URL) */
	file_path: string;
	/** Average user rating for this image */
	vote_average: number;
	/** Total number of votes for this image */
	vote_count: number;
	/** Image width in pixels */
	width: number;
};

/**
 * Base properties shared between movie and TV show results
 */
type BaseKnownForItem = {
	adult: boolean;
	backdrop_path: string | null;
	id: number;
	original_language: string;
	overview: string;
	poster_path: string | null;
	genre_ids: number[];
	popularity: number;
	vote_average: number;
	vote_count: number;
};

/**
 * Movie item in known_for array
 */
export type KnownForMovie = BaseKnownForItem & {
	/** Media type discriminator */
	media_type: "movie";
	/** Movie title (localized) */
	title: string;
	/** Original title in the original language */
	original_title: string;
	/** Release date in ISO 8601 format (YYYY-MM-DD) */
	release_date: string;
	/** Whether a video is available on TMDB */
	video: boolean;
};

/**
 * TV show item in known_for array
 */
export type KnownForTV = BaseKnownForItem & {
	/** Media type discriminator */
	media_type: "tv";
	/** Series name (localized) */
	name: string;
	/** Original series name */
	original_name: string;
	/** First air date (YYYY-MM-DD) */
	first_air_date: string;
	/** Origin country codes (ISO 3166-1 array) */
	origin_country: CountryISO3166_1[];
};

/**
 * Union type for items in the known_for array (can be either movie or TV show)
 */
export type KnownForItem = KnownForMovie | KnownForTV;

export type MediaType = "movie" | "tv";
