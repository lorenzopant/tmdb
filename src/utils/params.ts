import { TMDBOptions } from "../tmdb";

/**
 * Merges default options with required parameters, returning only the keys present in both types.
 * Method params take precedence over defaults.
 */
export function mergeParams<TParams extends object>(defaults: TMDBOptions, params: TParams): TParams {
	const filteredDefaults = Object.keys(defaults)
		.filter((key) => Object.keys(params).includes(key))
		.reduce<Record<string, any>>((obj, key) => {
			obj[key] = defaults[key as keyof TMDBOptions];
			return obj;
		}, {});
	return { ...filteredDefaults, ...params };
}
