import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
	serverExternalPackages: ["@takumi-rs/image-response", "@takumi-rs/core", "takumi-js", "@modelcontextprotocol/sdk"],

	reactStrictMode: true,
	experimental: {
		useTypeScriptCli: true,
	},
	async rewrites() {
		return [
			{
				source: "/docs/:path*.md",
				destination: "/llms.mdx/docs/:path*",
			},
			{
				source: "/docs/:path*.mdx",
				destination: "/llms.mdx/docs/:path*",
			},
		];
	},
};

export default withMDX(config);
