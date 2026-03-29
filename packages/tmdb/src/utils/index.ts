export * from "./logger";
export * from "./jwt";

// MARK: - Type Guards

/** Utility type guard to check if an object has a poster_path property */
export function hasPosterPath(data: unknown): data is { poster_path: string } {
	return (
		typeof data === "object" &&
		data !== null &&
		"poster_path" in data &&
		typeof (data as Record<string, unknown>).poster_path === "string"
	);
}

/** Utility type guard to check if an object has a backdrop_path property */
export function hasBackdropPath(data: unknown): data is { backdrop_path: string } {
	return (
		typeof data === "object" &&
		data !== null &&
		"backdrop_path" in data &&
		typeof (data as Record<string, unknown>).backdrop_path === "string"
	);
}

/** Utility type guard to check if an object has a profile_path property */
export function hasProfilePath(data: unknown): data is { profile_path: string } {
	return (
		typeof data === "object" &&
		data !== null &&
		"profile_path" in data &&
		typeof (data as Record<string, unknown>).profile_path === "string"
	);
}

/** Utility type guard to check if an object has a still_path property */
export function hasStillPath(data: unknown): data is { still_path: string } {
	return (
		typeof data === "object" &&
		data !== null &&
		"still_path" in data &&
		typeof (data as Record<string, unknown>).still_path === "string"
	);
}

/** Utility type guard to check if an object has a logo_path property */
export function hasLogoPath(data: unknown): data is { logo_path: string } {
	return (
		typeof data === "object" && data !== null && "logo_path" in data && typeof (data as Record<string, unknown>).logo_path === "string"
	);
}
