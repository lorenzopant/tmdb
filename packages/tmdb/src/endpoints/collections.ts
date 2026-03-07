import { ENDPOINTS } from "../routes";
import {
	CollectionBaseParam,
	Collection,
	CollectionDetailsParams,
	CollectionImages,
	CollectionImagesParams,
	CollectionTranslations,
} from "../types/other/collections";
import { TMDBAPIBase } from "./base";

export class CollectionsAPI extends TMDBAPIBase {
	private collectionPath(collection_id: number): string {
		return `${ENDPOINTS.COLLECTIONS.DETAILS}/${collection_id}`;
	}

	/**
	 * Details
	 * GET - https://api.themoviedb.org/3/collection/{collection_id}
	 *
	 * Get collection details by ID.
	 *
	 * @param collection_id Unique identifier for the collection
	 * @param language Language for the response
	 * @reference https://developer.themoviedb.org/reference/collection-details
	 */
	async details(params: CollectionDetailsParams): Promise<Collection> {
		const { language = this.defaultOptions.language, ...rest } = params;
		const endpoint = this.collectionPath(params.collection_id);
		return this.client.request<Collection>(endpoint, { language, ...rest });
	}

	/**
	 * Images
	 * GET - https://api.themoviedb.org/3/collection/{collection_id}/images
	 *
	 * Get the images that belong to a collection.
	 * This method will return the backdrops and posters that have been added to a collection.
	 *
	 * @param collection_id Unique identifier for the collection
	 * @param language Language for the response
	 * @param include_image_language Additional language for images
	 * @reference https://developer.themoviedb.org/reference/collection-images
	 */
	async images(params: CollectionImagesParams): Promise<CollectionImages> {
		const endpoint = `${this.collectionPath(params.collection_id)}${ENDPOINTS.COLLECTIONS.IMAGES}`;
		const requestParams = this.withLanguage(params) ?? params;
		return this.client.request<CollectionImages>(endpoint, requestParams);
	}

	/**
	 * Translations
	 * GET - https://api.themoviedb.org/3/collection/{collection_id}/translations
	 *
	 * Get collection translations by ID.
	 *
	 * @param collection_id Unique identifier for the collection
	 * @reference https://developer.themoviedb.org/reference/collection-translations
	 */
	async translations(params: CollectionBaseParam): Promise<CollectionTranslations> {
		const endpoint = `${this.collectionPath(params.collection_id)}${ENDPOINTS.COLLECTIONS.TRANSLATIONS}`;
		return this.client.request<CollectionTranslations>(endpoint, params);
	}
}
