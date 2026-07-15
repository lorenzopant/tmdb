import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// Export the search index statically instead of running Orama on the server per
// query. `staticGET` is prerendered at build time into a single cache-hit file;
// the client (RootProvider search type: "static") downloads it once and runs all
// querying in-browser. This removes the per-keystroke Serverless Function
// invocations and Edge Requests that made /api/search a top-billed route.
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
	// https://docs.orama.com/docs/orama-js/supported-languages
	language: "english",
});
