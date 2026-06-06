export const MovieReleaseType = {
	Premiere: 1,
	TheatricalLimited: 2,
	Theatrical: 3,
	Digital: 4,
	Physical: 5,
	TV: 6,
} as const;

export type MovieReleaseType = (typeof MovieReleaseType)[keyof typeof MovieReleaseType];

export const MovieReleaseTypeLabel: Record<MovieReleaseType, string> = {
	1: "Premiere",
	2: "Theatrical (Limited)",
	3: "Theatrical",
	4: "Digital",
	5: "Physical",
	6: "TV",
};

/**
 * TV status values accepted by TMDB discover filters.
 * @reference https://developer.themoviedb.org/reference/discover-tv
 */
export const DiscoverTVStatus = {
	ReturningSeries: 0,
	Planned: 1,
	InProduction: 2,
	Ended: 3,
	Canceled: 4,
	Pilot: 5,
} as const;

export type DiscoverTVStatus = (typeof DiscoverTVStatus)[keyof typeof DiscoverTVStatus];

export const DiscoverTVStatusLabel: Record<DiscoverTVStatus, string> = {
	0: "Returning Series",
	1: "Planned",
	2: "In Production",
	3: "Ended",
	4: "Canceled",
	5: "Pilot",
};

/**
 * TV type values accepted by TMDB discover filters.
 * @reference https://developer.themoviedb.org/reference/discover-tv
 */
export const DiscoverTVType = {
	Documentary: 0,
	News: 1,
	Miniseries: 2,
	Reality: 3,
	Scripted: 4,
	TalkShow: 5,
	Video: 6,
} as const;

export type DiscoverTVType = (typeof DiscoverTVType)[keyof typeof DiscoverTVType];

export const DiscoverTVTypeLabel: Record<DiscoverTVType, string> = {
	0: "Documentary",
	1: "News",
	2: "Miniseries",
	3: "Reality",
	4: "Scripted",
	5: "Talk Show",
	6: "Video",
};

/**
 * Supported episode group type identifiers.
 */
export const TVEpisodeGroupType = {
	OriginalAirDate: 1,
	Absolute: 2,
	Dvd: 3,
	Digital: 4,
	StoryArc: 5,
	Production: 6,
	TV: 7,
} as const;

export type TVEpisodeGroupType = (typeof TVEpisodeGroupType)[keyof typeof TVEpisodeGroupType];

export const TVEpisodeGroupTypeLabel: Record<TVEpisodeGroupType, string> = {
	1: "Original Air Date",
	2: "Absolute",
	3: "DVD",
	4: "Digital",
	5: "Story Arc",
	6: "Production",
	7: "TV",
};
