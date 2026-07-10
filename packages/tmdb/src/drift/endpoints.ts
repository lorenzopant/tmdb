// src/drift/endpoints.ts

import { TMDB } from "../tmdb";

/**
 * Canonical, well-populated, stable IDs. Chosen so that optional/nested fields are
 * actually present in the response (a barely-populated title would under-report the
 * true shape of the endpoint).
 */
const MOVIE_ID = 550; // Fight Club
const MOVIE_ID_2 = 27205; // Inception
const SERIES_ID = 1396; // Breaking Bad
const SEASON_NUMBER = 1;
const EPISODE_NUMBER = 1;
const PERSON_ID = 287; // Brad Pitt
const COLLECTION_ID = 10; // Star Wars collection
const COMPANY_ID = 1; // Lucasfilm
const NETWORK_ID = 213; // Netflix
const KEYWORD_ID = 9715;
// Fight Club cast credit (Edward Norton) — verified 200 while building this suite.
const CREDIT_ID = "52fe4250c3a36847f80149f3";
// Breaking Bad "DVD / PVOD" episode group — verified 200 while building this suite.
const EPISODE_GROUP_ID = "69f50757054263b7bc87e32a";
// A real, existing Fight Club review — verified 200 while building this suite.
const REVIEW_ID = "5b1c13b9c3a36848f2026384";
// Breaking Bad season 1's season_id / episode 1's episode_id — `changes` is looked up
// by these flat IDs rather than by series_id + season_number/episode_number.
const SEASON_ID = 3572;
const EPISODE_ID = 62085;

const MOVIE_APPEND_ALL = [
	"alternative_titles",
	"changes",
	"credits",
	"external_ids",
	"images",
	"keywords",
	"recommendations",
	"release_dates",
	"reviews",
	"similar",
	"translations",
	"videos",
	"watch/providers",
] as const;

const TV_SERIES_APPEND_ALL = [
	"aggregate_credits",
	"alternative_titles",
	"changes",
	"content_ratings",
	"credits",
	"episode_groups",
	"external_ids",
	"images",
	"keywords",
	"lists",
	"recommendations",
	"reviews",
	"screened_theatrically",
	"similar",
	"translations",
	"videos",
	"watch/providers",
] as const;

/**
 * Identity helper that PRESERVES each row's concrete `call` return type instead of widening
 * it to `Promise<unknown>`. The `const` type parameter keeps the inferred `Promise<T>` per row,
 * which lets `type-tree.ts` (ts-morph) read each endpoint's real declared response type off the
 * arrow function. `t` is still typed as `TMDB` via the constraint, so no per-row annotation is
 * needed. Do NOT add an explicit `CALLS: {...}[]` annotation — it would erase the return types
 * again and the type-tree extractor would see `unknown`.
 */
const defineCalls = <
	const T extends readonly { label: string; call: (t: TMDB) => Promise<unknown> }[],
>(
	calls: T,
): T => calls;

/**
 * One row per distinct response SHAPE for every read endpoint the library exposes.
 * `label` is unique and stable — it feeds the test title AND keys the type-tree JSON.
 *
 * Auth/session-scoped namespaces are intentionally excluded (they need a user session/JWT
 * and can't run unattended): `account`, `authentication`, `guest_sessions`, `lists`, `v4`.
 */
export const CALLS = defineCalls([
	// --- movies ---
	{ label: "movies.details", call: (t) => t.movies.details({ movie_id: MOVIE_ID }) },
	{
		label: "movies.details+append",
		call: (t) =>
			t.movies.details({ movie_id: MOVIE_ID, append_to_response: [...MOVIE_APPEND_ALL] }),
	},
	{
		label: "movies.alternative_titles",
		call: (t) => t.movies.alternative_titles({ movie_id: MOVIE_ID }),
	},
	{ label: "movies.credits", call: (t) => t.movies.credits({ movie_id: MOVIE_ID }) },
	{ label: "movies.external_ids", call: (t) => t.movies.external_ids({ movie_id: MOVIE_ID }) },
	{ label: "movies.keywords", call: (t) => t.movies.keywords({ movie_id: MOVIE_ID }) },
	{
		label: "movies.changes",
		call: (t) =>
			t.movies.changes({ movie_id: MOVIE_ID, start_date: "2024-12-20", end_date: "2024-12-24" }),
	},
	{ label: "movies.images", call: (t) => t.movies.images({ movie_id: MOVIE_ID }) },
	// NOTE: `movies.latest` intentionally excluded — returns a different, freshly-added record on
	// every call (often sparsely populated), so its key set is non-deterministic and unfit for a
	// committed baseline. Its MovieDetails shape is already covered by `movies.details`.
	{
		label: "movies.recommendations",
		call: (t) => t.movies.recommendations({ movie_id: MOVIE_ID }),
	},
	{ label: "movies.release_dates", call: (t) => t.movies.release_dates({ movie_id: MOVIE_ID }) },
	{ label: "movies.reviews", call: (t) => t.movies.reviews({ movie_id: MOVIE_ID }) },
	{ label: "movies.similar", call: (t) => t.movies.similar({ movie_id: MOVIE_ID }) },
	{ label: "movies.translations", call: (t) => t.movies.translations({ movie_id: MOVIE_ID }) },
	{ label: "movies.videos", call: (t) => t.movies.videos({ movie_id: MOVIE_ID }) },
	{
		label: "movies.watch_providers",
		call: (t) => t.movies.watch_providers({ movie_id: MOVIE_ID }),
	},
	// Second canonical movie (belongs to a franchise) — cheap extra coverage for optional fields.
	{ label: "movies.details (franchise)", call: (t) => t.movies.details({ movie_id: MOVIE_ID_2 }) },

	// --- movie_lists ---
	{ label: "movie_lists.now_playing", call: (t) => t.movie_lists.now_playing() },
	{ label: "movie_lists.popular", call: (t) => t.movie_lists.popular() },
	{ label: "movie_lists.top_rated", call: (t) => t.movie_lists.top_rated() },
	{ label: "movie_lists.upcoming", call: (t) => t.movie_lists.upcoming() },

	// --- search ---
	{ label: "search.movies", call: (t) => t.search.movies({ query: "fight club" }) },
	{ label: "search.collections", call: (t) => t.search.collections({ query: "star wars" }) },
	{ label: "search.company", call: (t) => t.search.company({ query: "lucasfilm" }) },
	{ label: "search.keyword", call: (t) => t.search.keyword({ query: "action" }) },
	{ label: "search.person", call: (t) => t.search.person({ query: "brad pitt" }) },
	{ label: "search.tv_series", call: (t) => t.search.tv_series({ query: "breaking bad" }) },
	{ label: "search.multi", call: (t) => t.search.multi({ query: "fight club" }) },

	// --- configuration ---
	{ label: "configuration.details", call: (t) => t.configuration.details() },
	{ label: "configuration.countries", call: (t) => t.configuration.countries() },
	{ label: "configuration.jobs", call: (t) => t.configuration.jobs() },
	{ label: "configuration.languages", call: (t) => t.configuration.languages() },
	{
		label: "configuration.primary_translations",
		call: (t) => t.configuration.primary_translations(),
	},
	{ label: "configuration.timezones", call: (t) => t.configuration.timezones() },

	// --- genres ---
	{ label: "genres.movie_list", call: (t) => t.genres.movie_list() },
	{ label: "genres.tv_list", call: (t) => t.genres.tv_list() },

	// --- keywords ---
	{ label: "keywords.details", call: (t) => t.keywords.details({ keyword_id: KEYWORD_ID }) },
	{ label: "keywords.movies", call: (t) => t.keywords.movies({ keyword_id: KEYWORD_ID }) },

	// --- tv_lists ---
	{ label: "tv_lists.airing_today", call: (t) => t.tv_lists.airing_today() },
	{ label: "tv_lists.on_the_air", call: (t) => t.tv_lists.on_the_air() },
	{ label: "tv_lists.popular", call: (t) => t.tv_lists.popular() },
	{ label: "tv_lists.top_rated", call: (t) => t.tv_lists.top_rated() },

	// --- tv_series ---
	{ label: "tv_series.details", call: (t) => t.tv_series.details({ series_id: SERIES_ID }) },
	{
		label: "tv_series.details+append",
		call: (t) =>
			t.tv_series.details({ series_id: SERIES_ID, append_to_response: [...TV_SERIES_APPEND_ALL] }),
	},
	{
		label: "tv_series.aggregate_credits",
		call: (t) => t.tv_series.aggregate_credits({ series_id: SERIES_ID }),
	},
	{
		label: "tv_series.alternative_titles",
		call: (t) => t.tv_series.alternative_titles({ series_id: SERIES_ID }),
	},
	{
		label: "tv_series.changes",
		call: (t) =>
			t.tv_series.changes({
				series_id: SERIES_ID,
				start_date: "2024-12-20",
				end_date: "2024-12-24",
			}),
	},
	{
		label: "tv_series.content_ratings",
		call: (t) => t.tv_series.content_ratings({ series_id: SERIES_ID }),
	},
	{ label: "tv_series.credits", call: (t) => t.tv_series.credits({ series_id: SERIES_ID }) },
	{
		label: "tv_series.episode_groups",
		call: (t) => t.tv_series.episode_groups({ series_id: SERIES_ID }),
	},
	{
		label: "tv_series.external_ids",
		call: (t) => t.tv_series.external_ids({ series_id: SERIES_ID }),
	},
	{ label: "tv_series.images", call: (t) => t.tv_series.images({ series_id: SERIES_ID }) },
	{ label: "tv_series.keywords", call: (t) => t.tv_series.keywords({ series_id: SERIES_ID }) },
	// NOTE: `tv_series.latest` excluded (non-deterministic newest record); shape covered by `tv_series.details`.
	{ label: "tv_series.lists", call: (t) => t.tv_series.lists({ series_id: SERIES_ID }) },
	{
		label: "tv_series.recommendations",
		call: (t) => t.tv_series.recommendations({ series_id: SERIES_ID }),
	},
	{ label: "tv_series.reviews", call: (t) => t.tv_series.reviews({ series_id: SERIES_ID }) },
	{
		label: "tv_series.screened_theatrically",
		call: (t) => t.tv_series.screened_theatrically({ series_id: SERIES_ID }),
	},
	{ label: "tv_series.similar", call: (t) => t.tv_series.similar({ series_id: SERIES_ID }) },
	{
		label: "tv_series.translations",
		call: (t) => t.tv_series.translations({ series_id: SERIES_ID }),
	},
	{ label: "tv_series.videos", call: (t) => t.tv_series.videos({ series_id: SERIES_ID }) },
	{
		label: "tv_series.watch_providers",
		call: (t) => t.tv_series.watch_providers({ series_id: SERIES_ID }),
	},

	// --- tv_seasons ---
	{
		label: "tv_seasons.details",
		call: (t) => t.tv_seasons.details({ series_id: SERIES_ID, season_number: SEASON_NUMBER }),
	},
	{
		label: "tv_seasons.details+append",
		call: (t) =>
			t.tv_seasons.details({
				series_id: SERIES_ID,
				season_number: SEASON_NUMBER,
				append_to_response: [
					"aggregate_credits",
					"credits",
					"external_ids",
					"images",
					"translations",
					"videos",
					"watch/providers",
				],
			}),
	},
	{
		label: "tv_seasons.aggregate_credits",
		call: (t) =>
			t.tv_seasons.aggregate_credits({ series_id: SERIES_ID, season_number: SEASON_NUMBER }),
	},
	{
		label: "tv_seasons.credits",
		call: (t) => t.tv_seasons.credits({ series_id: SERIES_ID, season_number: SEASON_NUMBER }),
	},
	{
		label: "tv_seasons.external_ids",
		call: (t) => t.tv_seasons.external_ids({ series_id: SERIES_ID, season_number: SEASON_NUMBER }),
	},
	{
		label: "tv_seasons.images",
		call: (t) => t.tv_seasons.images({ series_id: SERIES_ID, season_number: SEASON_NUMBER }),
	},
	{
		label: "tv_seasons.translations",
		call: (t) => t.tv_seasons.translations({ series_id: SERIES_ID, season_number: SEASON_NUMBER }),
	},
	{
		label: "tv_seasons.videos",
		call: (t) => t.tv_seasons.videos({ series_id: SERIES_ID, season_number: SEASON_NUMBER }),
	},
	{
		label: "tv_seasons.watch_providers",
		call: (t) =>
			t.tv_seasons.watch_providers({ series_id: SERIES_ID, season_number: SEASON_NUMBER }),
	},
	{
		label: "tv_seasons.changes",
		call: (t) => t.tv_seasons.changes({ season_id: SEASON_ID, start_date: "2024-12-20", end_date: "2024-12-24" }),
	},

	// --- tv_episodes ---
	{
		label: "tv_episodes.details",
		call: (t) =>
			t.tv_episodes.details({
				series_id: SERIES_ID,
				season_number: SEASON_NUMBER,
				episode_number: EPISODE_NUMBER,
			}),
	},
	{
		label: "tv_episodes.details+append",
		call: (t) =>
			t.tv_episodes.details({
				series_id: SERIES_ID,
				season_number: SEASON_NUMBER,
				episode_number: EPISODE_NUMBER,
				append_to_response: ["credits", "external_ids", "images", "translations", "videos"],
			}),
	},
	{
		label: "tv_episodes.credits",
		call: (t) =>
			t.tv_episodes.credits({
				series_id: SERIES_ID,
				season_number: SEASON_NUMBER,
				episode_number: EPISODE_NUMBER,
			}),
	},
	{
		label: "tv_episodes.external_ids",
		call: (t) =>
			t.tv_episodes.external_ids({
				series_id: SERIES_ID,
				season_number: SEASON_NUMBER,
				episode_number: EPISODE_NUMBER,
			}),
	},
	{
		label: "tv_episodes.images",
		call: (t) =>
			t.tv_episodes.images({
				series_id: SERIES_ID,
				season_number: SEASON_NUMBER,
				episode_number: EPISODE_NUMBER,
			}),
	},
	{
		label: "tv_episodes.translations",
		call: (t) =>
			t.tv_episodes.translations({
				series_id: SERIES_ID,
				season_number: SEASON_NUMBER,
				episode_number: EPISODE_NUMBER,
			}),
	},
	{
		label: "tv_episodes.videos",
		call: (t) =>
			t.tv_episodes.videos({
				series_id: SERIES_ID,
				season_number: SEASON_NUMBER,
				episode_number: EPISODE_NUMBER,
			}),
	},

	{
		label: "tv_episodes.changes",
		call: (t) => t.tv_episodes.changes({ episode_id: EPISODE_ID, start_date: "2024-12-20", end_date: "2024-12-24" }),
	},

	// --- tv_episode_groups ---
	{
		label: "tv_episode_groups.details",
		call: (t) => t.tv_episode_groups.details({ episode_group_id: EPISODE_GROUP_ID }),
	},

	// --- watch_providers ---
	{ label: "watch_providers.movie_providers", call: (t) => t.watch_providers.movie_providers() },
	{ label: "watch_providers.tv_providers", call: (t) => t.watch_providers.tv_providers() },
	{
		label: "watch_providers.available_regions",
		call: (t) => t.watch_providers.available_regions(),
	},

	// --- certifications ---
	{
		label: "certifications.movie_certifications",
		call: (t) => t.certifications.movie_certifications(),
	},
	{ label: "certifications.tv_certifications", call: (t) => t.certifications.tv_certifications() },

	// --- changes ---
	{ label: "changes.movie_list", call: (t) => t.changes.movie_list() },
	{ label: "changes.people_list", call: (t) => t.changes.people_list() },
	{ label: "changes.tv_list", call: (t) => t.changes.tv_list() },

	// --- companies ---
	{ label: "companies.details", call: (t) => t.companies.details({ company_id: COMPANY_ID }) },
	{
		label: "companies.alternative_names",
		call: (t) => t.companies.alternative_names({ company_id: COMPANY_ID }),
	},
	{ label: "companies.images", call: (t) => t.companies.images({ company_id: COMPANY_ID }) },

	// --- credits ---
	{ label: "credits.details", call: (t) => t.credits.details({ credit_id: CREDIT_ID }) },

	// --- collections ---
	{
		label: "collections.details",
		call: (t) => t.collections.details({ collection_id: COLLECTION_ID }),
	},
	{
		label: "collections.images",
		call: (t) => t.collections.images({ collection_id: COLLECTION_ID }),
	},
	{
		label: "collections.translations",
		call: (t) => t.collections.translations({ collection_id: COLLECTION_ID }),
	},

	// --- discover ---
	{ label: "discover.movie", call: (t) => t.discover.movie() },
	{ label: "discover.tv", call: (t) => t.discover.tv() },

	// --- find ---
	{
		label: "find.by_id",
		call: (t) => t.find.by_id({ external_id: "tt0137523", external_source: "imdb_id" }),
	},

	// --- networks ---
	{ label: "networks.details", call: (t) => t.networks.details({ network_id: NETWORK_ID }) },
	{
		label: "networks.alternative_names",
		call: (t) => t.networks.alternative_names({ network_id: NETWORK_ID }),
	},
	{ label: "networks.images", call: (t) => t.networks.images({ network_id: NETWORK_ID }) },

	// --- trending ---
	{ label: "trending.all", call: (t) => t.trending.all({ time_window: "day" }) },
	{ label: "trending.movies", call: (t) => t.trending.movies({ time_window: "day" }) },
	{ label: "trending.tv", call: (t) => t.trending.tv({ time_window: "day" }) },
	{ label: "trending.people", call: (t) => t.trending.people({ time_window: "day" }) },

	// --- reviews ---
	{ label: "reviews.details", call: (t) => t.reviews.details({ review_id: REVIEW_ID }) },

	// --- people_lists ---
	{ label: "people_lists.popular", call: (t) => t.people_lists.popular() },

	// --- people ---
	{ label: "people.details", call: (t) => t.people.details({ person_id: PERSON_ID }) },
	{
		label: "people.details+append",
		call: (t) =>
			t.people.details({
				person_id: PERSON_ID,
				append_to_response: [
					"changes",
					"combined_credits",
					"external_ids",
					"images",
					"movie_credits",
					"tagged_images",
					"translations",
					"tv_credits",
				],
			}),
	},
	{
		label: "people.changes",
		call: (t) =>
			t.people.changes({ person_id: PERSON_ID, start_date: "2024-12-20", end_date: "2024-12-24" }),
	},
	{
		label: "people.combined_credits",
		call: (t) => t.people.combined_credits({ person_id: PERSON_ID }),
	},
	{ label: "people.external_ids", call: (t) => t.people.external_ids({ person_id: PERSON_ID }) },
	{ label: "people.images", call: (t) => t.people.images({ person_id: PERSON_ID }) },
	// NOTE: `people.latest` excluded (non-deterministic newest record); shape covered by `people.details`.
	{ label: "people.movie_credits", call: (t) => t.people.movie_credits({ person_id: PERSON_ID }) },
	{ label: "people.tagged_images", call: (t) => t.people.tagged_images({ person_id: PERSON_ID }) },
	{ label: "people.translations", call: (t) => t.people.translations({ person_id: PERSON_ID }) },
	{ label: "people.tv_credits", call: (t) => t.people.tv_credits({ person_id: PERSON_ID }) },
]);
