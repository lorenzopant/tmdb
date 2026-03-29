import { describe, expect, it } from "vitest";

import { isJwt } from "../../utils/jwt";

function toBase64Url(value: string): string {
	const bytes = new TextEncoder().encode(value);
	let binary = "";

	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function createToken(header: unknown, payload: unknown, signature = "signature"): string {
	return [toBase64Url(JSON.stringify(header)), toBase64Url(JSON.stringify(payload)), signature].join(".");
}

describe("isJwt", () => {
	it("returns false for non-string values", () => {
		expect(isJwt(123 as unknown as string)).toBe(false);
	});

	it("returns false when the token does not have exactly three parts", () => {
		expect(isJwt("not-a-jwt")).toBe(false);
		expect(isJwt("one.two")).toBe(false);
		expect(isJwt("one.two.three.four")).toBe(false);
	});

	it("returns false when any token part contains invalid base64url characters", () => {
		expect(isJwt("abc.def.ghi+")).toBe(false);
	});

	it("returns false when base64url decoding fails", () => {
		expect(isJwt("a.eyJhbGciOiJIUzI1NiJ9.signature")).toBe(false);
	});

	it("returns false when decoded json cannot be parsed", () => {
		const invalidJson = toBase64Url("not json");
		const validPayload = toBase64Url(JSON.stringify({ sub: "test" }));
		expect(isJwt(`${invalidJson}.${validPayload}.signature`)).toBe(false);
	});

	it("returns false when the decoded header is not an object", () => {
		const header = toBase64Url(JSON.stringify("header"));
		const payload = toBase64Url(JSON.stringify({ sub: "test" }));
		expect(isJwt(`${header}.${payload}.signature`)).toBe(false);
	});

	it("returns false when the decoded header does not include a string alg", () => {
		expect(isJwt(createToken({}, { sub: "test" }))).toBe(false);
		expect(isJwt(createToken({ alg: 123 }, { sub: "test" }))).toBe(false);
	});

	it("returns false when the decoded payload is not an object", () => {
		const header = toBase64Url(JSON.stringify({ alg: "HS256" }));
		const payload = toBase64Url(JSON.stringify("payload"));
		expect(isJwt(`${header}.${payload}.signature`)).toBe(false);
	});

	it("returns false when exp is present but not a number", () => {
		expect(isJwt(createToken({ alg: "HS256" }, { exp: "123" }))).toBe(false);
	});

	it("returns false when nbf is present but not a number", () => {
		expect(isJwt(createToken({ alg: "HS256" }, { nbf: "123" }))).toBe(false);
	});

	it("returns false when iat is present but not a number", () => {
		expect(isJwt(createToken({ alg: "HS256" }, { iat: "123" }))).toBe(false);
	});

	it("returns false when the payload cannot be base64url decoded", () => {
		const header = toBase64Url(JSON.stringify({ alg: "HS256" }));
		expect(isJwt(`${header}.a.signature`)).toBe(false);
	});

	it("returns true for a well-formed JWT", () => {
		expect(isJwt(createToken({ alg: "HS256", typ: "JWT" }, { sub: "test", iat: 1, exp: 2 }))).toBe(true);
	});
});
