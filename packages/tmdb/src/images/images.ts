import { ImagesConfig } from "../types";
import { BackdropSize, IMAGE_BASE_URL, IMAGE_SECURE_BASE_URL, LogoSize, PosterSize, ProfileSize, StillSize } from "../types/config/images";

export class ImageAPI {
	private options: ImagesConfig;

	constructor(options: ImagesConfig = {}) {
		this.options = { secure_images_url: true, ...options };
	}

	private buildUrl(path: string, size: string): string {
		const baseUrl = this.options.secure_images_url ? IMAGE_SECURE_BASE_URL : IMAGE_BASE_URL;
		return `${baseUrl}${size}${path}`;
	}

	public backdrop(path: string, size: BackdropSize = this.options.default_image_sizes?.backdrops || "w780"): string {
		return this.buildUrl(path, size);
	}

	public logo(path: string, size: LogoSize = this.options.default_image_sizes?.logos || "w185"): string {
		return this.buildUrl(path, size);
	}

	public poster(path: string, size: PosterSize = this.options.default_image_sizes?.posters || "w500"): string {
		return this.buildUrl(path, size);
	}

	public profile(path: string, size: ProfileSize = this.options.default_image_sizes?.profiles || "w185"): string {
		return this.buildUrl(path, size);
	}

	public still(path: string, size: StillSize = this.options.default_image_sizes?.still || "w300"): string {
		return this.buildUrl(path, size);
	}
}
