import { NextRequest, NextResponse } from "next/server";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";

const { rewrite: rewriteLLM } = rewritePath("/docs{/*path}", "/llms.mdx/docs{/*path}");

export default function proxy(request: NextRequest) {
	if (isMarkdownPreferred(request)) {
		const result = rewriteLLM(request.nextUrl.pathname);

		if (result) {
			return NextResponse.rewrite(new URL(result, request.nextUrl));
		}
	}

	return NextResponse.next();
}

// Only run on /docs/* — the only paths where markdown negotiation applies.
// Without a matcher the proxy runs as an Edge Function on every request
// (static assets, RSC prefetches, og, api, favicon), each a billed no-op.
export const config = {
	matcher: ["/docs/:path*"],
};
