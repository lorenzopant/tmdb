// MARK: General

/**
 * Typeguard that checks if a value is a record object.
 * @param value - The value to check
 * @returns `true` if the value is a non-null object that is not an array, `false` otherwise
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Typeguard that checks whether a value is a plain object.
 * Plain objects are objects whose prototype is `Object.prototype` or `null`.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (!isRecord(value)) return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

// MARK: Images

/**
 * Utility type guard to check if an object has a poster_path property.
 * Narrows to `T & { poster_path: string }` so the input type survives — this keeps
 * the guard usable in `Array.prototype.filter`, whose narrowing overload requires
 * the predicate type to extend the element type.
 */
export function hasPosterPath<T>(data: T): data is T & { poster_path: string } {
	return (
		typeof data === "object" &&
		data !== null &&
		"poster_path" in data &&
		typeof (data as Record<string, unknown>).poster_path === "string"
	);
}

/** Utility type guard to check if an object has a backdrop_path property. Narrows to `T & { backdrop_path: string }`. */
export function hasBackdropPath<T>(data: T): data is T & { backdrop_path: string } {
	return (
		typeof data === "object" &&
		data !== null &&
		"backdrop_path" in data &&
		typeof (data as Record<string, unknown>).backdrop_path === "string"
	);
}

/** Utility type guard to check if an object has a profile_path property. Narrows to `T & { profile_path: string }`. */
export function hasProfilePath<T>(data: T): data is T & { profile_path: string } {
	return (
		typeof data === "object" &&
		data !== null &&
		"profile_path" in data &&
		typeof (data as Record<string, unknown>).profile_path === "string"
	);
}

/** Utility type guard to check if an object has a still_path property. Narrows to `T & { still_path: string }`. */
export function hasStillPath<T>(data: T): data is T & { still_path: string } {
	return (
		typeof data === "object" &&
		data !== null &&
		"still_path" in data &&
		typeof (data as Record<string, unknown>).still_path === "string"
	);
}

/** Utility type guard to check if an object has a logo_path property. Narrows to `T & { logo_path: string }`. */
export function hasLogoPath<T>(data: T): data is T & { logo_path: string } {
	return (
		typeof data === "object" && data !== null && "logo_path" in data && typeof (data as Record<string, unknown>).logo_path === "string"
	);
}
