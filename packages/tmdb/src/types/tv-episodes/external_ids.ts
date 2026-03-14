import { TVExternalIDs } from "../tv_series";

export type TVEpisodeExternalIDs = Omit<TVExternalIDs, "facebook_id" | "instagram_id" | "twitter_id">;
