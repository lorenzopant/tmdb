import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { createGenerator, createFileSystemGeneratorCache } from "fumadocs-typescript";
import { AutoTypeTable } from "fumadocs-typescript/ui";

const generator = createGenerator({
	// set a cache, necessary for serverless platform like Vercel
	cache: createFileSystemGeneratorCache(".next/fumadocs-typescript"),
});

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultComponents,
		AutoTypeTable: ({ path, ...rest }) => (
			<AutoTypeTable path={`../../packages/tmdb/src/types/${path}`} {...rest} generator={generator} />
		),
		...components,
	};
}
