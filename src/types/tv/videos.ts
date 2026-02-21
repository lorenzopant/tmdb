import { VideoItem } from "../common";

/** List of videos related to a TV show. */
export type TVVideos = {
	/** TMDB unique identifier for the TV show. */
	id: number;

	/** List of video results. */
	results: VideoItem[];
};
