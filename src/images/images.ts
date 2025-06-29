import { BackdropSize, IMAGE_BASE_URL, IMAGE_SECURE_BASE_URL, LogoSize, PosterSize, ProfileSize, StillSize } from "../types/images";

export class ImageAPI {
	private useSecure: boolean;

	constructor(useSecure: boolean = true) {
		this.useSecure = useSecure;
	}

	private buildUrl(path: string, size: string): string {
		const baseUrl = this.useSecure ? IMAGE_SECURE_BASE_URL : IMAGE_BASE_URL;
		return `${baseUrl}${size}${path}`;
	}

	public backdrop(path: string, size: BackdropSize = "w780"): string {
		return this.buildUrl(path, size);
	}

	public logo(path: string, size: LogoSize = "w185"): string {
		return this.buildUrl(path, size);
	}

	public poster(path: string, size: PosterSize = "w500"): string {
		return this.buildUrl(path, size);
	}

	public profile(path: string, size: ProfileSize = "w185"): string {
		return this.buildUrl(path, size);
	}

	public still(path: string, size: StillSize = "w300"): string {
		return this.buildUrl(path, size);
	}
}
