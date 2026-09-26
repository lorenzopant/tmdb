import { LanguageISO6391 } from "./languages";

/**
 * Default configuration for video requests.
 */
export type VideosConfig = {
	/**
	 * Video languages to request on every `.videos()` call, and on `.details()` calls that append
	 * a `videos` block. Sent as `include_video_language` (comma-separated). Use `"null"` to include
	 * videos without a language tag.
	 *
	 * TMDB otherwise returns only videos tagged with the request `language`, which is often nothing
	 * for non-English languages. An explicit `include_video_language` at the call site always wins.
	 *
	 * @example
	 * // Italian videos plus the English trailers on every videos() call
	 * videos: { include_video_language: ["it", "en"] }
	 * // Equivalent to always passing: include_video_language: "it,en"
	 */
	include_video_language?: (LanguageISO6391 | "null")[];
};
