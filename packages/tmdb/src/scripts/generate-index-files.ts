// scripts/generate-index-files.ts
/// <reference types="node" />
import * as fs from "fs";
import * as path from "path";

function generateIndexForDir(dir: string) {
	const files = fs.readdirSync(dir);
	const exports: string[] = [];

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			exports.push(`export * from './${file}';`);
			generateIndexForDir(filePath); // Ricorsivo
		} else if (file.endsWith(".ts") && file !== "index.ts") {
			const fileName = file.replace(".ts", "");
			exports.push(`export * from './${fileName}';`);
		}
	});

	if (exports.length > 0) {
		const indexPath = path.join(dir, "index.ts");
		fs.writeFileSync(indexPath, exports.join("\n") + "\n");
		console.log(`✅ Generated ${indexPath}`);
	}
}

generateIndexForDir("src/types");
console.log("✅ All index.ts files generated!");
