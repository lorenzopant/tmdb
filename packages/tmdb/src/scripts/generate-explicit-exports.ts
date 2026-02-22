// scripts/generate-explicit-exports.ts
import * as fs from "fs";
import * as path from "path";

function extractExports(filePath: string): string[] {
	const content = fs.readFileSync(filePath, "utf-8");
	const exports: string[] = [];

	const typeMatches = content.matchAll(/export (?:type|interface) (\w+)/g);
	for (const match of typeMatches) {
		exports.push(match[1]);
	}

	return exports;
}

function generateExplicitIndex(dir: string) {
	const indexPath = path.join(dir, "index.ts");
	const files = fs.readdirSync(dir);

	const lines: string[] = [];

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (file === "index.ts") return;

		if (stat.isDirectory()) {
			// Per subdirectory, usa export *
			lines.push(`export * from './${file}';`);
		} else if (file.endsWith(".ts")) {
			// Per file, usa export named espliciti
			const fileName = file.replace(".ts", "");
			const exports = extractExports(filePath);

			if (exports.length > 0) {
				lines.push(`export { ${exports.join(", ")} } from './${fileName}';`);
			}
		}
	});

	fs.writeFileSync(indexPath, lines.join("\n") + "\n");
	console.log(`✅ Generated ${indexPath}`);

	// Ricorsivo per subdirectories
	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			generateExplicitIndex(filePath);
		}
	});
}

generateExplicitIndex("src/types");
console.log("✅ All explicit exports generated!");
