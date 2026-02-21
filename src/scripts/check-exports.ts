// scripts/check-exports.ts
import * as fs from "fs";
import * as path from "path";
import { Project } from "ts-morph";

function findAllExportedTypes(dir: string): Set<string> {
	const types = new Set<string>();
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			const subTypes = findAllExportedTypes(filePath);
			subTypes.forEach((t) => types.add(t));
		} else if (file.endsWith(".ts") && file !== "index.ts") {
			// Estrai i nomi dei tipi esportati
			const content = fs.readFileSync(filePath, "utf-8");
			const exportMatches = content.matchAll(/export (?:type|interface) (\w+)/g);

			for (const match of exportMatches) {
				types.add(match[1]);
			}
		}
	});

	return types;
}

function checkIndexExports(dir: string): string[] {
	const indexPath = path.join(dir, "index.ts");

	if (!fs.existsSync(indexPath)) {
		return [`Missing index.ts in ${dir}`];
	}

	const content = fs.readFileSync(indexPath, "utf-8");
	const subdirs = fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isDirectory());

	const files = fs
		.readdirSync(dir)
		.filter((f) => f.endsWith(".ts") && f !== "index.ts")
		.map((f) => f.replace(".ts", ""));

	const missing: string[] = [];

	// Controlla se tutti i file sono esportati
	files.forEach((file) => {
		if (!content.includes(`from './${file}'`) && !content.includes(`from "./${file}"`)) {
			missing.push(`${dir}/index.ts missing: export * from './${file}'`);
		}
	});

	// Controlla se tutte le subdirectory sono esportate
	subdirs.forEach((subdir) => {
		if (!content.includes(`from './${subdir}'`)) {
			missing.push(`${dir}/index.ts missing: export * from './${subdir}'`);
		}
	});

	// Ricorsivamente controlla subdirectories
	subdirs.forEach((subdir) => {
		const subMissing = checkIndexExports(path.join(dir, subdir));
		missing.push(...subMissing);
	});

	return missing;
}

// Run checks
const allDefinedTypes = findAllExportedTypes("src/types");
const missingExports = checkIndexExports("src/types");

console.log("=== All defined types ===");
console.log(Array.from(allDefinedTypes).sort());

console.log("\n=== Missing exports ===");
if (missingExports.length === 0) {
	console.log("✅ All exports are correct!");
} else {
	missingExports.forEach((m) => console.log("❌", m));
}

// Controlla cosa viene effettivamente esportato dal package
const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const sourceFile = project.getSourceFileOrThrow("src/index.ts");
const exported = sourceFile.getExportedDeclarations();

console.log("\n=== Actually exported from package ===");
const exportedTypeNames = new Set<string>();
exported.forEach((_decl, name) => {
	exportedTypeNames.add(name);
});
console.log(Array.from(exportedTypeNames).sort());

// Trova differenze
console.log("\n=== Types defined but NOT exported ===");
const notExported = Array.from(allDefinedTypes).filter((t) => !exportedTypeNames.has(t));
if (notExported.length === 0) {
	console.log("✅ All types are exported!");
} else {
	notExported.forEach((t) => console.log("❌", t));
}
