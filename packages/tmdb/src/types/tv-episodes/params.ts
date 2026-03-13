import { WithLanguage, WithParams } from "../common";
import { Language } from "../config";
import { TVSeasonBaseParams } from "../tv-seasons/params";
import { Prettify } from "../utility";
import { TVEpisodeAppendToResponseNamespace } from "./tv_episodes";

/**
 * Almost every query within the TV Episodes domain
 * will take this required param to identify the
 * tv show episode.
 */
export type TVEpisodeBaseParams = TVSeasonBaseParams & {
	/** Episode number */
	episode_number: number;
};

/** Uniquely identifies an episode across different tv shows. */
export type TVEpisodeId = {
	episode_id: string | number;
};

/**
 * Parameters for fetching TV episode details with optional additional data appended.
 */
export type TVEpisodeDetailsParams = Prettify<
	TVEpisodeBaseParams & { append_to_response?: TVEpisodeAppendToResponseNamespace[] } & WithParams<"language">
>;

/** Parameters for tv episode credits endpoint */
export type TVEpisodeCreditsParams = TVEpisodeBaseParams & WithLanguage;

export type TVEpisodeImagesParams = TVEpisodeBaseParams &
	WithLanguage & {
		include_image_language?: Language;
	};
