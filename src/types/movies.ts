// src/types/movies.ts

import {
	Cast,
	Changes,
	Collection,
	Crew,
	Genre,
	ImageItem,
	Keyword,
	ProductionCompany,
	ProductionCountry,
	SpokenLanguage,
	VideoItem,
} from "./common";
import { CountryISO3166_1 } from "./countries";
import { ReleaseType } from "./enums";
import { PaginatedResponse } from "./params";

export type MovieDetails = {
	adult: boolean;
	backdrop_path: string | null;
	belongs_to_collection: Collection | null;
	budget: number;
	genres: Genre[];
	homepage: string | null;
	id: number;
	imdb_id: string | null;
	origin_country: string[];
	original_language: string;
	original_title: string;
	overview: string | null;
	popularity: number;
	poster_path: string | null;
	production_companies: ProductionCompany[];
	production_countries: ProductionCountry[];
	release_date: string; // ISO format (YYYY-MM-DD)
	revenue: number;
	runtime: number | null; // Some movies have no runtime set
	spoken_languages: SpokenLanguage[];
	status: string;
	tagline: string | null;
	title: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
};

export type MovieResultItem = {
	backdrop_path: string;
	id: number;
	title: string;
	original_title: string;
	overview: string;
	poster_path: string;
	adult: boolean;
	original_language: string;
	genre_ids: number[];
	popularity: number;
	release_date: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
};

export type MovieAlternativeTitles = {
	id: number;
	titles: MovieAlternativeTitle[];
};

export type MovieAlternativeTitle = {
	title: string;
	iso_3166_1: string;
	type: string;
};

export type MovieChanges = Changes;

export type MovieCredits = {
	id: number;
	cast: Cast[];
	crew: Crew[];
};

export type MovieExternalIDs = {
	id: number;
	imdb_id: string | null;
	facebook_id: string | null;
	twitter_id: string | null;
	instagram_id: string | null;
};

export type MovieKeywords = {
	id: number;
	keywords: Keyword[];
};

export type MovieImages = {
	id: number;
	backdrops: ImageItem[];
	logos: ImageItem[];
	posters: ImageItem[];
};

export type MovieRecommendations = PaginatedResponse<MovieResultItem>;
export type MovieSimilar = PaginatedResponse<MovieResultItem>;

export type MovieReleaseDates = {
	id: number;
	results: MovieReleaseDateResult[];
};

export type MovieReleaseDateResult = {
	iso_3166_1: string;
	release_dates: MovieReleaseDate[];
};

export type MovieReleaseDate = {
	certification: string;
	iso_639_1: string;
	release_date: string;
	type: ReleaseType | number;
	note: string;
	descriptors: unknown[];
};

export type MovieReviews = PaginatedResponse<MovieReview>;

export type MovieReview = {
	author: string;
	author_details: MovieReviewAuthorDetails;
	content: string;
	created_at: string;
	id: string;
	updated_at: string;
	url: string;
};

export type MovieReviewAuthorDetails = {
	name: string;
	username: string;
	avatar_path?: string;
	rating?: number;
};

export type MovieTranslations = {
	id: number;
	translations: MovieTranslationResults[];
};

export type MovieTranslationResults = {
	iso_3166_1: string;
	iso_639_1: string;
	name: string;
	english_name: string;
	data: {
		homepage: string;
		overview: string;
		runtime: number;
		tagline: string;
		title: string;
	};
};

export type MovieVideos = {
	id: number;
	results: VideoItem[];
};

export type MovieWatchProvider = {
	id: number;
	results: Record<CountryISO3166_1, WatchProvider[]>;
};

export type WatchProvider = {
	link: string;
	flatrate?: WatchProviderItem[];
	rent?: WatchProviderItem[];
	buy?: WatchProviderItem[];
};

export type WatchProviderItem = {
	logo_path: string;
	provider_id: number;
	provider_name: string;
	display_priority: number;
};

/** Append To Response */
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

export type MovieDetailsWithAppends<T extends readonly MovieAppendToResponseNamespace[]> = MovieDetails & {
	[K in T[number]]: MovieAppendableMap[K];
};
