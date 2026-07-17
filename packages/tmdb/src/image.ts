// src/image.ts — standalone entry for the Image API (no SDK client, no endpoints).
export { ImageAPI } from "./images/images";

export type {
	BackdropSize,
	FallbackUrlConfig,
	ImageSize,
	ImagesConfig,
	LogoSize,
	PosterSize,
	ProfileSize,
	StillSize,
} from "./types/config/images";
export type { ImageCollectionKey } from "./types/common/images";
