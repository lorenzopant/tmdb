import { Collection, Genre, ProductionCompany, ProductionCountry, SpokenLanguage } from "../common";
import { MovieAlternativeTitles } from "./alternative_titles";
import { MovieChanges } from "./changes";
import { MovieCredits } from "./credits";
import { MovieExternalIDs } from "./external_ids";
import { MovieImages } from "./images";
import { MovieKeywords } from "./keywords";
import { MovieRecommendations } from "./reccomendations";
import { MovieReleaseDates } from "./release_dates";
import { MovieReviews } from "./reviews";
import { MovieSimilar } from "./similar";
import { MovieTranslations } from "./translations";
import { MovieVideos } from "./videos";

/**
 * Complete movie details with metadata, production info, and statistics
 */
export type MovieDetails = {
	/** Whether the movie is marked as adult content */
	adult: boolean;
	/** Path to backdrop image, null if not available */
	backdrop_path: string | null;
	/** Collection the movie belongs to (e.g., "The Lord of the Rings Collection"), null if standalone */
	belongs_to_collection: Collection | null;
	/** Production budget in US dollars */
	budget: number;
	/** Array of genres associated with the movie */
	genres: Genre[];
	/** Official homepage URL, null if not available */
	homepage: string | null;
	/** Unique movie identifier in TMDB */
	id: number;
	/** IMDb identifier (e.g., "tt0133093"), null if not linked */
	imdb_id: string | null;
	/** Array of origin country codes (ISO 3166-1) */
	origin_country: string[];
	/** Original language of the movie (ISO 639-1 code) */
	original_language: string;
	/** Original title in the original language */
	original_title: string;
	/** Plot synopsis/overview, null if not available */
	overview: string | null;
	/** Popularity score calculated by TMDB */
	popularity: number;
	/** Path to poster image, null if not available */
	poster_path: string | null;
	/** Array of companies that produced the movie */
	production_companies: ProductionCompany[];
	/** Array of countries where the movie was produced */
	production_countries: ProductionCountry[];
	/** Release date in ISO 8601 format (YYYY-MM-DD) */
	release_date: string;
	/** Box office revenue in US dollars */
	revenue: number;
	/** Runtime in minutes, null if not set */
	runtime: number | null;
	/** Array of languages spoken in the movie */
	spoken_languages: SpokenLanguage[];
	/** Release status (e.g., "Released", "Post Production", "In Production") */
	status: string;
	/** Movie tagline/slogan, null if not available */
	tagline: string | null;
	/** Movie title (localized if language parameter was provided) */
	title: string;
	/** Whether a video is available on TMDB */
	video: boolean;
	/** Average user rating (0-10 scale) */
	vote_average: number;
	/** Total number of votes received */
	vote_count: number;
};

/**
 * Available endpoints that can be appended to movie details requests
 */
export type MovieAppendToResponseNamespace =
	| "alternative_titles"
	| "changes"
	| "credits"
	| "external_ids"
	| "images"
	| "keywords"
	| "recommendations"
	| "release_dates"
	| "reviews"
	| "similar"
	| "translations"
	| "videos";

/**
 * Mapping of append-to-response keys to their return types
 */
export type MovieAppendableMap = {
	alternative_titles: MovieAlternativeTitles;
	changes: MovieChanges;
	credits: MovieCredits;
	external_ids: MovieExternalIDs;
	images: MovieImages;
	keywords: MovieKeywords;
	recommendations: MovieRecommendations;
	release_dates: MovieReleaseDates;
	reviews: MovieReviews;
	similar: MovieSimilar;
	translations: MovieTranslations;
	videos: MovieVideos;
};

/**
 * Movie details with additional appended data
 * @template T - Array of namespace strings to append
 * @example
 * ```typescript
 * // Get movie details with credits and videos
 * const movie: MovieDetailsWithAppends<['credits', 'videos']> = await getMovie(550, {
 *   append_to_response: 'credits,videos'
 * });
 * ```
 */
export type MovieDetailsWithAppends<T extends readonly MovieAppendToResponseNamespace[]> = MovieDetails & {
	[K in T[number]]: MovieAppendableMap[K];
};
