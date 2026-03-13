import { VideoItem } from "../common";

/**
 * Collection of videos (trailers, teasers, clips) for a movie
 * TODO: Refactor this (shared with TVEpisodeVideos)
 */
export type MovieVideos = {
	/** Movie identifier */
	id: number;
	/** Array of video items */
	results: VideoItem[];
};
