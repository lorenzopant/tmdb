// src/index.ts
export { TMDB } from "./tmdb";
export { TMDBError } from "./errors/tmdb";

export { AuthenticationAPI } from "./endpoints/authentication";
export { AccountAPI } from "./endpoints/account";
export { CertificationsAPI } from "./endpoints/certifications";
export { ChangesAPI } from "./endpoints/changes";
export { CollectionsAPI } from "./endpoints/collections";
export { CompaniesAPI } from "./endpoints/companies";
export { ConfigurationAPI } from "./endpoints/configuration";
export { CreditsAPI } from "./endpoints/credits";
export { DiscoverAPI } from "./endpoints/discover";
export { FindAPI } from "./endpoints/find";
export { GenresAPI } from "./endpoints/genres";
export { KeywordsAPI } from "./endpoints/keywords";
export { MovieListsAPI } from "./endpoints/movie_lists";
export { MoviesAPI } from "./endpoints/movies";
export { NetworksAPI } from "./endpoints/networks";
export { PeopleAPI } from "./endpoints/people";
export { PeopleListsAPI } from "./endpoints/people_lists";
export { ReviewsAPI } from "./endpoints/reviews";
export { SearchAPI } from "./endpoints/search";
export { TrendingAPI } from "./endpoints/trending";
export { TVEpisodeGroupsAPI } from "./endpoints/tv_episode_groups";
export { TVEpisodesAPI } from "./endpoints/tv_episodes";
export { TVSeasonsAPI } from "./endpoints/tv_seasons";
export { TVSeriesAPI } from "./endpoints/tv_series";
export { TVSeriesListsAPI } from "./endpoints/tv_series_lists";
export { WatchProvidersAPI } from "./endpoints/watch_providers";

export * from "./types";
export * from "./utils";
