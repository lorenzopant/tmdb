import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
	},
	format: ["esm"],
	dts: true,
	clean: true,
	treeshake: true,
	sourcemap: false,
});
