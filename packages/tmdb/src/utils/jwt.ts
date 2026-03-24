type JwtHeader = {
	alg: string;
	typ?: string;
	[key: string]: unknown;
};

type JwtPayload = {
	exp?: number;
	nbf?: number;
	iat?: number;
	iss?: string;
	aud?: string | string[];
	sub?: string;
	[key: string]: unknown;
};

function isBase64Url(str: string): boolean {
	return /^[A-Za-z0-9\-_]+$/.test(str);
}

function decodeBase64Url(str: string): string | null {
	try {
		const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

		return atob(padded);
	} catch {
		return null;
	}
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isJwtHeader(value: unknown): value is JwtHeader {
	if (!isObject(value)) return false;
	return typeof value.alg === "string";
}

function isJwtPayload(value: unknown): value is JwtPayload {
	if (!isObject(value)) return false;

	if ("exp" in value && typeof value.exp !== "number") return false;
	if ("nbf" in value && typeof value.nbf !== "number") return false;
	if ("iat" in value && typeof value.iat !== "number") return false;

	return true;
}

export function isJwt(token: string): boolean {
	if (typeof token !== "string") return false;

	const parts = token.split(".");
	if (parts.length !== 3) return false;

	const [headerB64, payloadB64, signatureB64] = parts;

	if (!isBase64Url(headerB64) || !isBase64Url(payloadB64) || !isBase64Url(signatureB64)) {
		return false;
	}

	const headerStr = decodeBase64Url(headerB64);
	const payloadStr = decodeBase64Url(payloadB64);

	if (!headerStr || !payloadStr) return false;

	let parsedHeader: unknown;
	let parsedPayload: unknown;

	try {
		parsedHeader = JSON.parse(headerStr);
		parsedPayload = JSON.parse(payloadStr);
	} catch {
		return false;
	}

	if (!isJwtHeader(parsedHeader)) return false;
	if (!isJwtPayload(parsedPayload)) return false;

	return true;
}
