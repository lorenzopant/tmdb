// scripts/find-missing.ts
import * as fs from "fs";
import * as path from "path";

function findAllDefinedTypes(dir: string, types: Set<string> = new Set()): Set<string> {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			findAllDefinedTypes(filePath, types);
		} else if (file.endsWith(".ts") && file !== "index.ts") {
			const content = fs.readFileSync(filePath, "utf-8");
			const matches = content.matchAll(/export (?:type|interface) (\w+)/g);

			for (const match of matches) {
				types.add(match[1]);
			}
		}
	});

	return types;
}

function findExportedTypes(distPath: string): Set<string> {
	if (!fs.existsSync(distPath)) {
		console.log("❌ dist/index.d.ts not found. Run npm run build first!");
		return new Set();
	}

	const content = fs.readFileSync(distPath, "utf-8");
	const types = new Set<string>();

	// Pattern diversi per trovare export
	const patterns = [
		/export \{ ([^}]+) \}/g, // export { Type1, Type2 }
		/export type (\w+)/g, // export type MyType
		/export interface (\w+)/g, // export interface MyInterface
		/export declare type (\w+)/g, // export declare type MyType
		/export declare interface (\w+)/g, // export declare interface MyInterface
	];

	patterns.forEach((pattern) => {
		let match;
		while ((match = pattern.exec(content)) !== null) {
			if (match[1] && match[1].includes(",")) {
				// Multiple exports in {}
				match[1].split(",").forEach((t) => {
					const trimmed = t.trim().split(" as ")[0].trim();
					types.add(trimmed);
				});
			} else if (match[1]) {
				types.add(match[1]);
			}
		}
	});

	return types;
}

// Run analysis
console.log("🔍 Analyzing types...\n");

const definedTypes = findAllDefinedTypes("src/types");
console.log(`📊 Total defined types: ${definedTypes.size}\n`);

const exportedTypes = findExportedTypes("dist/index.d.ts");
console.log(`📦 Total exported types: ${exportedTypes.size}\n`);

// Find missing
const missing = Array.from(definedTypes)
	.filter((t) => !exportedTypes.has(t))
	.sort();

if (missing.length === 0) {
	console.log("✅ All types are exported!\n");
} else {
	console.log("❌ Types defined but NOT exported:\n");
	missing.slice(0, 30).forEach((t) => console.log(`  - ${t}`));

	if (missing.length > 30) {
		console.log(`  ... and ${missing.length - 30} more\n`);
	}

	console.log(`\nTotal missing: ${missing.length}\n`);

	// Find where they are defined
	console.log("📍 Location of first 5 missing types:\n");
	missing.slice(0, 5).forEach((typeName) => {
		const location = findTypeLocation("src/types", typeName);
		if (location) {
			console.log(`  ${typeName} → ${location}`);
		}
	});
}

function findTypeLocation(dir: string, typeName: string): string | null {
	const files = fs.readdirSync(dir, { recursive: true }) as string[];

	for (const file of files) {
		if (!file.endsWith(".ts") || file.endsWith("index.ts")) continue;

		const filePath = path.join(dir, file);
		const content = fs.readFileSync(filePath, "utf-8");

		if (content.includes(`export type ${typeName}`) || content.includes(`export interface ${typeName}`)) {
			return filePath;
		}
	}

	return null;
}
