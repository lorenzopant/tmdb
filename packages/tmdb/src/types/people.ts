import {
	Changes,
	DateRange,
	ImageItem,
	ImagesResult,
	MediaType,
	PaginatedResponse,
	TranslationResults,
	WithLanguage,
	WithPage,
} from "./common";
import { MovieResultItem, TVSeriesResultItem } from "./search";
import { Prettify } from "./utility";

/**
 * Top-level person details returned by TMDB.
 */
export type PersonDetails = {
	/** Whether the person is marked as adult content */
	adult: boolean;
	/** Alternative names or aliases */
	also_known_as: string[];
	/** Localized or default biography text */
	biography?: string;
	/** Date of birth in ISO 8601 format */
	birthday?: string;
	/** Date of death in ISO 8601 format, if applicable */
	deathday?: string;
	/** Gender code reported by TMDB */
	gender: number;
	/** Official homepage URL, if available */
	homepage?: string;
	/** TMDB person identifier */
	id: number;
	/** IMDb identifier, if linked */
	imdb_id?: string;
	/** Primary department the person is known for */
	known_for_department?: string;
	/** Display name */
	name: string;
	/** Place of birth, if known */
	place_of_birth?: string;
	/** Popularity score */
	popularity: number;
	/** Relative path to the profile image */
	profile_path?: string;
};

/**
 * Endpoints that can be appended to a person details request.
 */
export type PersonAppendToResponseNamespace =
	| "changes"
	| "combined_credits"
	| "external_ids"
	| "images"
	| "movie_credits"
	| "tagged_images"
	| "translations"
	| "tv_credits";

/**
 * Person details with appended subresources.
 */
export type PersonDetailsWithAppends<T extends readonly PersonAppendToResponseNamespace[]> = PersonDetails & {
	[K in T[number]]: PersonAppendableMap[K];
};

/**
 * Changes made to a person resource.
 */
export type PersonChanges = Changes;

/**
 * External identifiers linked to a person.
 */
export type PersonExternalIDs = {
	id: number;
	freebase_mid?: string;
	freebase_id?: string;
	imdb_id?: string;
	tvrage_id?: number;
	wikidata_id?: string;
	facebook_id?: string;
	instagram_id?: string;
	tiktok_id?: string;
	twitter_id?: string;
	youtube_id?: string;
};

/**
 * Profile images belonging to a person.
 */
export type PersonImages = ImagesResult<ImageItem, "profiles">;

/**
 * Cast credit for a movie on a person profile.
 */
export type PersonMovieCastCredit = MovieResultItem & {
	character: string;
	credit_id: string;
	order: number;
};

/**
 * Crew credit for a movie on a person profile.
 */
export type PersonMovieCrewCredit = MovieResultItem & {
	credit_id: string;
	department: string;
	job: string;
};

/**
 * Movie credits for a person.
 */
export type PersonMovieCredits = {
	id: number;
	cast: PersonMovieCastCredit[];
	crew: PersonMovieCrewCredit[];
};

/**
 * Cast credit for a TV show on a person profile.
 */
export type PersonTVCastCredit = TVSeriesResultItem & {
	character: string;
	credit_id: string;
	episode_count: number;
};

/**
 * Crew credit for a TV show on a person profile.
 */
export type PersonTVCrewCredit = TVSeriesResultItem & {
	credit_id: string;
	department: string;
	episode_count: number;
	job: string;
};

/**
 * TV credits for a person.
 */
export type PersonTVCredits = {
	id: number;
	cast: PersonTVCastCredit[];
	crew: PersonTVCrewCredit[];
};

/**
 * Combined movie/TV cast credit for a person.
 */
export type PersonCombinedCastCredit =
	| (PersonMovieCastCredit & { media_type: "movie" })
	| (PersonTVCastCredit & { media_type: "tv" });

/**
 * Combined movie/TV crew credit for a person.
 */
export type PersonCombinedCrewCredit =
	| (PersonMovieCrewCredit & { media_type: "movie" })
	| (PersonTVCrewCredit & { media_type: "tv" });

/**
 * Combined credits for a person.
 */
export type PersonCombinedCredits = {
	id: number;
	cast: PersonCombinedCastCredit[];
	crew: PersonCombinedCrewCredit[];
};

/**
 * Tagged image media payload associated with a person image tag.
 */
export type PersonTaggedImageMedia =
	| (MovieResultItem & { media_type: "movie" })
	| (TVSeriesResultItem & { media_type: "tv" });

/**
 * A single tagged image entry for a person.
 */
export type PersonTaggedImage = ImageItem & {
	id: string;
	image_type: string;
	media: PersonTaggedImageMedia;
	media_type: MediaType;
};

/**
 * Paginated tagged images for a person.
 */
export type PersonTaggedImages = PaginatedResponse<PersonTaggedImage> & {
	id: number;
};

/**
 * Translation payload for person records.
 */
export type PersonTranslationData = {
	biography?: string;
	name?: string;
};

/**
 * Available translations for a person.
 */
export type PersonTranslations = TranslationResults<PersonTranslationData>;

/**
 * Mapping of person append keys to their response types.
 */
export type PersonAppendableMap = {
	changes: PersonChanges;
	combined_credits: PersonCombinedCredits;
	external_ids: PersonExternalIDs;
	images: PersonImages;
	movie_credits: PersonMovieCredits;
	tagged_images: PersonTaggedImages;
	translations: PersonTranslations;
	tv_credits: PersonTVCredits;
};

/**
 * Base param for person-specific endpoints.
 */
export type PersonBaseParam = {
	person_id: number;
};

/**
 * Parameters for fetching person details.
 */
export type PersonDetailsParams = Prettify<
	PersonBaseParam & {
		append_to_response?: PersonAppendToResponseNamespace | PersonAppendToResponseNamespace[];
	} & WithLanguage
>;

/**
 * Parameters for fetching person changes.
 */
export type PersonChangesParams = Prettify<PersonBaseParam & WithPage & DateRange>;

/**
 * Parameters for language-aware person credit endpoints.
 */
export type PersonCreditsParams = Prettify<PersonBaseParam & WithLanguage>;

export type PersonExternalIDsParams = PersonBaseParam;
export type PersonImagesParams = PersonBaseParam;
export type PersonTranslationsParams = PersonBaseParam;
export type PersonTaggedImagesParams = Prettify<PersonBaseParam & WithPage>;
