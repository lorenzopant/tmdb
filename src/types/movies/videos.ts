import { VideoItem } from "../common";

/**
 * Collection of videos (trailers, teasers, clips) for a movie
 */
export type MovieVideos = {
	/** Movie identifier */
	id: number;
	/** Array of video items */
	results: VideoItem[];
};
