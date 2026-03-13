import { TVExternalIDs } from "../tv/external_ids";

export type TVEpisodeExternalIDs = Omit<TVExternalIDs, "facebook_id" | "instagram_id" | "twitter_id">;
