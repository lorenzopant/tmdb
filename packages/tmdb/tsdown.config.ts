import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		index: "src/index.ts",
	},
	format: ["esm"],
	dts: true,
	clean: true,
	treeshake: true,
	minify: true,
	sourcemap: false,
	hash: false,
});
