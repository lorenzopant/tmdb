import { ENDPOINTS } from "../routes";
import { TMDBAPIBase } from "./base";
import type {
	PersonAppendToResponseNamespace,
	PersonChanges,
	PersonChangesParams,
	PersonCombinedCredits,
	PersonCreditsParams,
	PersonDetails,
	PersonDetailsParams,
	PersonDetailsWithAppends,
	PersonExternalIDs,
	PersonExternalIDsParams,
	PersonImages,
	PersonImagesParams,
	PersonMovieCredits,
	PersonTaggedImages,
	PersonTaggedImagesParams,
	PersonTranslations,
	PersonTranslationsParams,
	PersonTVCredits,
} from "../types/people";

export class PeopleAPI extends TMDBAPIBase {
	private personPath(person_id: number): string {
		return `${ENDPOINTS.PEOPLE.DETAILS}/${person_id}`;
	}

	private personSubPath(person_id: number, route: string): string {
		return `${this.personPath(person_id)}${route}`;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/person/{person_id}
	 *
	 * Get the primary person details by TMDB person id.
	 * @param person_id The TMDB person id.
	 * @param append_to_response Additional person subresources to append.
	 * @param language Language for localized results.
	 * @reference https://developer.themoviedb.org/reference/person-details
	 */
	async details<T extends readonly PersonAppendToResponseNamespace[] = []>(
		params: PersonDetailsParams & { append_to_response?: T[number] | T },
	): Promise<T extends [] ? PersonDetails : PersonDetailsWithAppends<T>> {
		const { language = this.defaultOptions.language, person_id, ...rest } = params;
		return this.client.request(this.personPath(person_id), { language, ...rest });
	}

	/**
	 * Changes
	 * GET - https://api.themoviedb.org/3/person/{person_id}/changes
	 *
	 * Get the change history for a person.
	 * @reference https://developer.themoviedb.org/reference/person-changes
	 */
	async changes(params: PersonChangesParams): Promise<PersonChanges> {
		const { person_id, ...rest } = params;
		return this.client.request(this.personSubPath(person_id, ENDPOINTS.PEOPLE.CHANGES), rest);
	}

	/**
	 * Combined Credits
	 * GET - https://api.themoviedb.org/3/person/{person_id}/combined_credits
	 *
	 * Get movie and TV credits in a single response.
	 * @reference https://developer.themoviedb.org/reference/person-combined-credits
	 */
	async combined_credits(params: PersonCreditsParams): Promise<PersonCombinedCredits> {
		const { language = this.defaultOptions.language, person_id, ...rest } = params;
		return this.client.request(this.personSubPath(person_id, ENDPOINTS.PEOPLE.COMBINED_CREDITS), {
			language,
			...rest,
		});
	}

	/**
	 * External IDs
	 * GET - https://api.themoviedb.org/3/person/{person_id}/external_ids
	 *
	 * Get external platform identifiers for a person.
	 * @reference https://developer.themoviedb.org/reference/person-external-ids
	 */
	async external_ids(params: PersonExternalIDsParams): Promise<PersonExternalIDs> {
		return this.client.request(this.personSubPath(params.person_id, ENDPOINTS.PEOPLE.EXTERNAL_IDS));
	}

	/**
	 * Images
	 * GET - https://api.themoviedb.org/3/person/{person_id}/images
	 *
	 * Get profile images for a person.
	 * @reference https://developer.themoviedb.org/reference/person-images
	 */
	async images(params: PersonImagesParams): Promise<PersonImages> {
		return this.client.request(this.personSubPath(params.person_id, ENDPOINTS.PEOPLE.IMAGES));
	}

	/**
	 * Latest
	 * GET - https://api.themoviedb.org/3/person/latest
	 *
	 * Get the newest person id added to TMDB.
	 * @reference https://developer.themoviedb.org/reference/person-latest-id
	 */
	async latest(): Promise<PersonDetails> {
		return this.client.request(`${ENDPOINTS.PEOPLE.DETAILS}${ENDPOINTS.PEOPLE.LATEST}`);
	}

	/**
	 * Movie Credits
	 * GET - https://api.themoviedb.org/3/person/{person_id}/movie_credits
	 *
	 * Get a person's movie cast and crew credits.
	 * @reference https://developer.themoviedb.org/reference/person-movie-credits
	 */
	async movie_credits(params: PersonCreditsParams): Promise<PersonMovieCredits> {
		const { language = this.defaultOptions.language, person_id, ...rest } = params;
		return this.client.request(this.personSubPath(person_id, ENDPOINTS.PEOPLE.MOVIE_CREDITS), {
			language,
			...rest,
		});
	}

	/**
	 * Tagged Images
	 * GET - https://api.themoviedb.org/3/person/{person_id}/tagged_images
	 *
	 * Get images where the person has been tagged.
	 * @reference https://developer.themoviedb.org/reference/person-tagged-images
	 */
	async tagged_images(params: PersonTaggedImagesParams): Promise<PersonTaggedImages> {
		const { person_id, ...rest } = params;
		return this.client.request(this.personSubPath(person_id, ENDPOINTS.PEOPLE.TAGGED_IMAGES), rest);
	}

	/**
	 * Translations
	 * GET - https://api.themoviedb.org/3/person/{person_id}/translations
	 *
	 * Get the translations available for a person biography and name.
	 * @reference https://developer.themoviedb.org/reference/person-translations
	 */
	async translations(params: PersonTranslationsParams): Promise<PersonTranslations> {
		return this.client.request(this.personSubPath(params.person_id, ENDPOINTS.PEOPLE.TRANSLATIONS));
	}

	/**
	 * TV Credits
	 * GET - https://api.themoviedb.org/3/person/{person_id}/tv_credits
	 *
	 * Get a person's TV cast and crew credits.
	 * @reference https://developer.themoviedb.org/reference/person-tv-credits
	 */
	async tv_credits(params: PersonCreditsParams): Promise<PersonTVCredits> {
		const { language = this.defaultOptions.language, person_id, ...rest } = params;
		return this.client.request(this.personSubPath(person_id, ENDPOINTS.PEOPLE.TV_CREDITS), {
			language,
			...rest,
		});
	}
}
