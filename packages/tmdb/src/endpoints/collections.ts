import { ENDPOINTS } from "../routes";
import { Collection } from "../types";
import {
	BaseCollectionParam,
	CollectionDetailsParams,
	CollectionImages,
	CollectionImagesParams,
	CollectionTranslations,
} from "../types/other/collections";
import { TMDBAPIBase } from "./base";

export class CollectionsAPI extends TMDBAPIBase {
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
		const endpoint = `${ENDPOINTS.COLLECTIONS.DETAILS}/${params.collection_id}`;
		return this.client.request<Collection>(endpoint, params);
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
		const endpoint = `${ENDPOINTS.COLLECTIONS.DETAILS}/${params.collection_id}${ENDPOINTS.COLLECTIONS.IMAGES}`;
		return this.client.request<CollectionImages>(endpoint, params);
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
	async translations(params: BaseCollectionParam): Promise<CollectionTranslations> {
		const endpoint = `${ENDPOINTS.COLLECTIONS.DETAILS}/${params.collection_id}${ENDPOINTS.COLLECTIONS.TRANSLATIONS}`;
		return this.client.request<CollectionTranslations>(endpoint, params);
	}
}
