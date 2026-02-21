import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import ts from "typescript";

interface JSDocInfo {
	description: string;
	reference?: string;
	params: Map<string, string>;
}

interface MethodInfo {
	name: string;
	description: string;
	signature: string;
	returnType: string;
	reference?: string;
	params: Array<{ name: string; type: string; optional: boolean; description: string }>;
	fullMethodDocs: string;
}

interface EndpointInfo {
	apiClassName: string;
	endpointName: string;
	sourceFile: string;
	description: string;
	methods: MethodInfo[];
	typeImports: Set<string>;
}

// Map API class names to output filenames
const ENDPOINT_MAPPING: Record<string, string> = {
	MoviesAPI: "movies",
	MovieListsAPI: "movie-lists",
	SearchAPI: "search",
	ImageAPI: "images",
	ConfigurationAPI: "configuration",
	GenresAPI: "genres",
	TVSeriesListsAPI: "tv-lists",
	TVSeriesAPI: "tv-series",
};

// Map API class names to source file paths
const CLASS_TO_SOURCE_FILE: Record<string, string> = {
	MoviesAPI: "src/endpoints/movies.ts",
	MovieListsAPI: "src/endpoints/movie_lists.ts",
	SearchAPI: "src/endpoints/search.ts",
	ImageAPI: "src/images/images.ts",
	ConfigurationAPI: "src/endpoints/configuration.ts",
	GenresAPI: "src/endpoints/genres.ts",
	TVSeriesListsAPI: "src/endpoints/tv_series_lists.ts",
	TVSeriesAPI: "src/endpoints/tv_series.ts",
};

// All endpoints now follow the same structure: {endpoint}/{method}/index.mdx

function extractJSDocInfo(node: ts.Node): JSDocInfo {
	const info: JSDocInfo = {
		description: "",
		params: new Map(),
	};

	const jsDocTags = ts.getJSDocTags(node);
	const jsDocComments = ts.getJSDocCommentsAndTags(node);

	for (const tag of jsDocTags) {
		if (tag.tagName.text === "reference" && tag.comment) {
			info.reference = typeof tag.comment === "string" ? tag.comment : "";
		} else if (tag.tagName.text === "param") {
			if (Array.isArray(tag.comment)) {
				const text = tag.comment.map((c: ts.JSDocComment) => c.text).join("");
				const match = text.match(/(\w+)\s*(.*)/);
				if (match) {
					info.params.set(match[1], match[2] || "");
				}
			}
		}
	}

	// Extract main description (first line of comment)
	for (const doc of jsDocComments) {
		if (ts.isJSDoc(doc) && doc.comment) {
			if (typeof doc.comment === "string") {
				info.description = doc.comment.split("\n")[0].trim();
			} else if (Array.isArray(doc.comment)) {
				info.description = doc.comment
					.map((c: ts.JSDocComment) => c.text)
					.join("")
					.split("\n")[0]
					.trim();
			}
		}
	}

	return info;
}

function getTypeString(typeNode: ts.TypeNode | undefined): string {
	if (!typeNode) return "any";

	const printer = ts.createPrinter();
	const typeStr = printer.printNode(ts.EmitHint.Unspecified, typeNode, undefined as unknown as ts.SourceFile);

	// Extract inner type from Promise<T>
	if (typeStr.startsWith("Promise<")) {
		return typeStr.slice(8, -1);
	}

	return typeStr || "unknown";
}

function camelToTitle(camelCase: string): string {
	// Handle snake_case: convert underscores to spaces and capitalize words
	if (camelCase.includes("_")) {
		return camelCase
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	}

	// Handle camelCase: split on capital letters and capitalize each word
	return camelCase
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.trim();
}

function endpointNameToTitle(endpointName: string): string {
	// Convert endpoint names like "movie-lists" to "Movie Lists"
	return endpointName
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}
function extractImportedTypes(sourceFile: string): Map<string, string> {
	const typeDefinitions = new Map<string, string>();
	const source = readFileSync(sourceFile, "utf-8");
	const sourceNode = ts.createSourceFile(sourceFile, source, ts.ScriptTarget.Latest, true);

	// Find all import statements and collect imported types
	ts.forEachChild(sourceNode, (node) => {
		if (ts.isImportDeclaration(node)) {
			const importClause = node.importClause;
			if (importClause?.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
				importClause.namedBindings.elements.forEach((el) => {
					const name = el.propertyName?.text || el.name.text;
					const moduleName = (node.moduleSpecifier as ts.StringLiteral).text;
					typeDefinitions.set(name, moduleName);
				});
			}
		}
	});

	return typeDefinitions;
}

function getFullTypeDefinition(typeName: string, importPath: string): string {
	try {
		// Handle relative paths
		let resolvedPath = importPath;
		if (resolvedPath.startsWith("./")) {
			resolvedPath = resolvedPath.substring(2);
		}
		if (resolvedPath.startsWith("../")) {
			resolvedPath = resolvedPath.replace(/\.\.\//g, "");
		}
		
		// Add .ts extension if missing
		if (!resolvedPath.endsWith(".ts")) {
			resolvedPath += ".ts";
		}

		const typeSourcePath = resolve(__dirname, "../src", resolvedPath);
		const typeSource = readFileSync(typeSourcePath, "utf-8");
		const typeSourceNode = ts.createSourceFile(typeSourcePath, typeSource, ts.ScriptTarget.Latest, true);

		let typeDefinition = "";
		ts.forEachChild(typeSourceNode, (node) => {
			if (ts.isTypeAliasDeclaration(node) && (node.name as ts.PropertyName & { escapedText: string })?.escapedText === typeName) {
				const printer = ts.createPrinter();
				typeDefinition = printer.printNode(ts.EmitHint.Unspecified, node, typeSourceNode);
			}
		});

		return typeDefinition || "";
	} catch {
		return "";
	}
}
function extractMethodInfo(method: ts.MethodDeclaration): MethodInfo | null {
	const methodName = (method.name as ts.PropertyName & { escapedText: string })?.escapedText;
	if (!methodName || methodName.startsWith("_")) return null;

	const jsDocInfo = extractJSDocInfo(method);
	const signature = method.type;
	const params = method.parameters || [];

	const paramStrings = params.map((param) => {
		const paramName = (param.name as ts.PropertyName & { escapedText: string })?.escapedText || "unknown";
		const paramType = param.type ? getTypeString(param.type) : "any";
		const optional = param.questionToken ? "?" : "";
		return `${paramName}${optional}: ${paramType}`;
	});

	const returnType = signature ? getTypeString(signature) : "any";
	const fullSignature = `${methodName}(${paramStrings.join(", ")}): Promise<${returnType}>`;

	// Build full method docs
	let fullMethodDocs = `### \`${methodName}()\`\n\n`;
	if (jsDocInfo.description) {
		fullMethodDocs += `${jsDocInfo.description}\n\n`;
	}

	fullMethodDocs += `\`\`\`typescript\n${fullSignature}\n\`\`\`\n\n`;

	// Parameters table
	const parsedParams: Array<{ name: string; type: string; optional: boolean; description: string }> = [];
	if (params.length > 0) {
		fullMethodDocs += `#### Parameters\n\n`;
		fullMethodDocs += `| Parameter | Type | Required | Description |\n`;
		fullMethodDocs += `|-----------|------|----------|-------------|\n`;

		for (const param of params) {
			const paramName = (param.name as ts.PropertyName & { escapedText: string })?.escapedText || "?";
			const paramType = param.type ? getTypeString(param.type) : "unknown";
			const optional = !!param.questionToken;
			const description = jsDocInfo.params.get(paramName) || "";
			parsedParams.push({ name: paramName, type: paramType, optional, description });
			fullMethodDocs += `| \`${paramName}\` | \`${paramType}\` | ${optional ? "" : "✓"} | ${description} |\n`;
		}
		fullMethodDocs += `\n`;
	}

	fullMethodDocs += `#### Returns\n\n\`${returnType}\`\n\n`;

	if (jsDocInfo.reference) {
		fullMethodDocs += `**Reference:** [View on TMDB API](${jsDocInfo.reference})\n\n`;
	}

	return {
		name: methodName,
		description: jsDocInfo.description,
		signature: fullSignature,
		returnType,
		reference: jsDocInfo.reference,
		params: parsedParams,
		fullMethodDocs,
	};
}

function extractEndpointInfo(apiClassName: string, sourceFile: string): EndpointInfo | null {
	const source = readFileSync(sourceFile, "utf-8");
	const sourceNode = ts.createSourceFile(sourceFile, source, ts.ScriptTarget.Latest, true);

	const endpointName = ENDPOINT_MAPPING[apiClassName] || "";
	let classNode: ts.ClassDeclaration | undefined;
	let classInfo: JSDocInfo = { description: "", params: new Map() };

	// Find the API class
	ts.forEachChild(sourceNode, (node) => {
		if (ts.isClassDeclaration(node) && (node.name as ts.PropertyName & { escapedText: string })?.escapedText === apiClassName) {
			classNode = node;
			classInfo = extractJSDocInfo(node);
		}
	});

	if (!classNode) return null;

	const methods: MethodInfo[] = [];

	// Extract method documentation
	for (const member of classNode.members) {
		if (ts.isMethodDeclaration(member)) {
			const methodInfo = extractMethodInfo(member);
			if (methodInfo) {
				methods.push(methodInfo);
			}
		}
	}

	return {
		apiClassName,
		endpointName,
		sourceFile,
		description: classInfo.description,
		methods,
		typeImports: new Set(),
	};
}

function generateEndpointIndexMdx(endpoint: EndpointInfo): string {
	const title = endpointNameToTitle(endpoint.endpointName);

	let mdx = `---
title: ${title}
description: API reference for ${endpoint.apiClassName}
---

# ${title}

`;

	if (endpoint.description) {
		mdx += `${endpoint.description}\n\n`;
	}

	mdx += `## Available Methods\n\n`;
	mdx += `| Method | Description |\n`;
	mdx += `|--------|-------------|\n`;

	for (const method of endpoint.methods) {
		const methodPath = `/api-reference/${endpoint.endpointName}/${method.name}`;
		mdx += `| [\`${method.name}()\`](${methodPath}) | ${method.description} |\n`;
	}

	return mdx;
}

function generateMethodMdx(endpoint: EndpointInfo, method: MethodInfo): string {
	const title = camelToTitle(method.name);
	const endpointTitle = endpointNameToTitle(endpoint.endpointName);

	// Collect types used in this method
	const methodTypes = new Set<string>();
	methodTypes.add(method.returnType);
	for (const param of method.params) {
		methodTypes.add(param.type);
	}
	// Remove primitive types
	const relevantTypes = Array.from(methodTypes)
		.filter((t) => !["void", "string", "number", "boolean", "any", "unknown"].includes(t))
		.sort();

	const mdx = `---
title: ${title}
description: ${method.description}
---

# ${title}

${method.fullMethodDocs}

## Related Types

See [${endpointTitle} Types](/docs/types/${endpoint.endpointName}) for complete type definitions.
${relevantTypes.length > 0 ? `\n**Types used in this method:**\n${relevantTypes.map((t) => `- \`${t}\``).join("\n")}\n` : ""}
`;

	return mdx;
}

function generateEndpointTypesMdx(endpoint: EndpointInfo): string {
	const title = endpointNameToTitle(endpoint.endpointName);
	const importedTypes = extractImportedTypes(endpoint.sourceFile);

	let mdx = `---
title: ${title} Types
description: TypeScript type definitions for ${title} API
---

# Types

`;

	if (importedTypes.size === 0) {
		mdx += "No types currently documented for this endpoint.";
		return mdx;
	}

	// Group types by category
	const typesByCategory = new Map<string, string[]>();
	importedTypes.forEach((modulePath, typeName) => {
		if (typeName === "string" || typeName === "String") return; // Skip primitives
		const category = modulePath.split("/").slice(-1)[0].replace(".ts", "");
		if (!typesByCategory.has(category)) {
			typesByCategory.set(category, []);
		}
		const catTypes = typesByCategory.get(category);
		if (catTypes) {
			catTypes.push(typeName);
		}
	});

	// Generate sections
	typesByCategory.forEach((types, category) => {
		mdx += `## ${category}\n\n`;
		for (const typeName of types.sort()) {
			mdx += `### \`${typeName}\`\n\n\`\`\`typescript\n`;
			const modulePath = importedTypes.get(typeName);
			const fullDef = modulePath ? getFullTypeDefinition(typeName, modulePath) : "";
			if (fullDef) {
				mdx += fullDef + "\n";
			} else {
				mdx += `export type ${typeName} = any;\n`;
			}
			mdx += `\`\`\`\n\n`;
		}
	});

	return mdx;
}

function generateTypesIndexMdx(endpoints: EndpointInfo[]): string {
	let mdx = `---
title: Types Reference
description: Complete TypeScript type definitions for TMDB API
---

# Types Reference

All TypeScript types used throughout the TMDB API are documented here, organized by their respective endpoints.

## Available Type Sets

| Endpoint | Types |
| -------- | ----- |
`;

	for (const endpoint of endpoints) {
		const typeSet = new Set<string>();
		for (const method of endpoint.methods) {
			typeSet.add(method.returnType);
			for (const param of method.params) {
				typeSet.add(param.type);
			}
		}
		const typeCount = Array.from(typeSet).filter((t) => t !== "any" && t !== "unknown").length;
		const title = endpointNameToTitle(endpoint.endpointName);
		mdx += `| [${title}](/docs/types/${endpoint.endpointName}) | ${typeCount} types |
`;
	}

	return mdx;
}

function generateRoutesConfig(endpoints: EndpointInfo[]): string {
	const routeCode = `// for page navigation & to sort on leftbar

export type EachRoute = {
    title: string;
    href: string;
    noLink?: true; // noLink will create a route segment (section) but cannot be navigated
    items?: EachRoute[];
    tag?: string;
};

export const ROUTES: EachRoute[] = [
    { title: "Introduction", href: "/introduction" },
    {
        title: "Getting Started",
        href: "/getting-started",
        items: [
            {
                title: "NextJS - SSR",
                href: "/ssr",
            },
        ],
    },
    { title: "Configuration", href: "/configuration" },
    {
        title: "API Reference",
        href: "/api-reference",
        items: [
${endpoints
	.map((endpoint) => {
		const title = endpointNameToTitle(endpoint.endpointName);
		const methodItems = endpoint.methods
			.map((method) => {
				const methodTitle = camelToTitle(method.name);
				return `                    {
                        title: "${methodTitle}",
                        href: "/${method.name}",
                    },`;
			})
			.join("\n");

		return `            {
                title: "${title}",
                href: "/${endpoint.endpointName}",
                items: [
${methodItems}
                ],
            },`;
	})
	.join("\n")}
        ],
    },
    {
        title: "Types",
        href: "/types",
        items: [
${endpoints
	.map((endpoint) => {
		const title = endpointNameToTitle(endpoint.endpointName);
		return `            {
                title: "${title}",
                href: "/${endpoint.endpointName}",
            },`;
	})
	.join("\n")}
        ],
    },
];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(node: EachRoute) {
    const ans: Page[] = [];
    if (!node.noLink) {
        ans.push({ title: node.title, href: node.href });
    }
    node.items?.forEach((subNode) => {
        const temp = { ...subNode, href: \`\${node.href}\${subNode.href}\` };
        ans.push(...getRecurrsiveAllLinks(temp));
    });
    return ans;
}

export const page_routes = ROUTES.map((it) => getRecurrsiveAllLinks(it)).flat();
`;

	return routeCode;
}

async function main() {
	const docsProjectPath = resolve(__dirname, "../../tmdb-docs");
	const apiRefDir = resolve(docsProjectPath, "contents/docs/api-reference");
	const typesDir = resolve(docsProjectPath, "contents/docs/types");

	// Create directories
	mkdirSync(apiRefDir, { recursive: true });
	mkdirSync(typesDir, { recursive: true });

	// Extract all endpoint information
	const endpoints: EndpointInfo[] = [];
	for (const className of Object.keys(CLASS_TO_SOURCE_FILE)) {
		const sourceFile = resolve(__dirname, `../${CLASS_TO_SOURCE_FILE[className]}`);

		try {
			const endpointInfo = extractEndpointInfo(className, sourceFile);
			if (endpointInfo) {
				endpoints.push(endpointInfo);
			}
		} catch (error) {
			console.warn(`Failed to extract endpoint ${className}:`, error);
		}
	}

	console.log(`Found ${endpoints.length} endpoints`);

	// Generate API Reference Documentation
	for (const endpoint of endpoints) {
		const endpointDir = resolve(apiRefDir, endpoint.endpointName);
		mkdirSync(endpointDir, { recursive: true });

		// Generate endpoint index
		const indexMdx = generateEndpointIndexMdx(endpoint);
		writeFileSync(resolve(endpointDir, "index.mdx"), indexMdx);
		console.log(`✓ Generated api-reference/${endpoint.endpointName}/index.mdx`);

		// Generate individual method pages
		for (const method of endpoint.methods) {
			const methodDir = resolve(endpointDir, method.name);
			mkdirSync(methodDir, { recursive: true });

			const methodMdx = generateMethodMdx(endpoint, method);
			writeFileSync(resolve(methodDir, "index.mdx"), methodMdx);
			console.log(`✓ Generated api-reference/${endpoint.endpointName}/${method.name}/index.mdx`);
		}
	}

	// Generate Types Documentation
	for (const endpoint of endpoints) {
		const typesEndpointDir = resolve(typesDir, endpoint.endpointName);
		mkdirSync(typesEndpointDir, { recursive: true });

		const typesMdx = generateEndpointTypesMdx(endpoint);
		writeFileSync(resolve(typesEndpointDir, "index.mdx"), typesMdx);
		console.log(`✓ Generated types/${endpoint.endpointName}/index.mdx`);
	}

	// Generate Types Index
	const typesIndexMdx = generateTypesIndexMdx(endpoints);
	writeFileSync(resolve(typesDir, "index.mdx"), typesIndexMdx);
	console.log(`✓ Generated types/index.mdx`);

	// Generate Routes Config
	const routesConfig = generateRoutesConfig(endpoints);
	const routesConfigPath = resolve(docsProjectPath, "lib/routes-config.ts");
	mkdirSync(resolve(docsProjectPath, "lib"), { recursive: true });
	writeFileSync(routesConfigPath, routesConfig);
	console.log(`✓ Generated lib/routes-config.ts`);

	console.log("\nDocumentation generation complete!");
}

main();
