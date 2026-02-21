import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import ts from "typescript";

interface JSDocInfo {
  description: string;
  reference?: string;
  params: Map<string, string>;
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
        const match = text.match(/(\w+)\s*(.*)/)
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

function generateMethodDocs(
  method: ts.MethodDeclaration
): string {
  const methodName = (method.name as ts.PropertyName & { escapedText: string })?.escapedText || "unknown";
  const jsDocInfo = extractJSDocInfo(method);

  let markdown = `### \`${methodName}()\`\n\n`;

  if (jsDocInfo.description) {
    markdown += `${jsDocInfo.description}\n\n`;
  }

  // Build method signature
  const signature = method.type;
  const params = method.parameters || [];

  const paramStrings = params.map((param) => {
    const paramName = (param.name as ts.PropertyName & { escapedText: string })?.escapedText || "unknown";
    const paramType = param.type ? getTypeString(param.type) : "any";
    const optional = param.questionToken ? "?" : "";
    return `${paramName}${optional}: ${paramType}`;
  });

  const returnType = signature ? getTypeString(signature) : "any";

  markdown += `\`\`\`typescript\n${methodName}(${paramStrings.join(", ")}): Promise<${returnType}>\n\`\`\`\n\n`;

  // Parameters table
  if (params.length > 0) {
    markdown += `#### Parameters\n\n`;
    markdown += `| Parameter | Type | Required | Description |\n`;
    markdown += `|-----------|------|----------|-------------|\n`;

    for (const param of params) {
      const paramName = (param.name as ts.PropertyName & { escapedText: string })?.escapedText || "?";
      const paramType = param.type ? getTypeString(param.type) : "unknown";
      const required = param.questionToken ? "" : "✓";
      const description = jsDocInfo.params.get(paramName) || "";
      markdown += `| \`${paramName}\` | \`${paramType}\` | ${required} | ${description} |\n`;
    }
    markdown += `\n`;
  }

  markdown += `#### Returns\n\n\`${returnType}\`\n\n`;

  if (jsDocInfo.reference) {
    markdown += `**Reference:** [View on TMDB API](${jsDocInfo.reference})\n\n`;
  }

  return markdown;
}

function generateApiDocumentation(
  apiClassName: string,
  sourceFile: string
): string | null {
  const source = readFileSync(sourceFile, "utf-8");
  const sourceNode = ts.createSourceFile(
    sourceFile,
    source,
    ts.ScriptTarget.Latest,
    true
  );

  let classNode: ts.ClassDeclaration | undefined;
  let classInfo: JSDocInfo = { description: "", params: new Map() };

  // Find the API class
  ts.forEachChild(sourceNode, (node) => {
    if (
      ts.isClassDeclaration(node) &&
      (node.name as ts.PropertyName & { escapedText: string })?.escapedText === apiClassName
    ) {
      classNode = node;
      classInfo = extractJSDocInfo(node);
    }
  });

  if (!classNode) return null;

  const title = apiClassName.replace("API", "");
  let mdx = `---
title: ${title}
description: API reference for ${apiClassName}
---

# ${title}

`;

  if (classInfo.description) {
    mdx += `${classInfo.description}\n\n`;
  }

  mdx += "## Methods\n\n";

  // Extract method documentation
  for (const member of classNode.members) {
    if (ts.isMethodDeclaration(member)) {
      const methodName = (member.name as ts.PropertyName & { escapedText: string })?.escapedText;
      if (methodName && !methodName.startsWith("_")) {
        mdx += generateMethodDocs(member);
      }
    }
  }

  return mdx;
}

async function main(): Promise<void> {
  try {
    const targetDocsDir = resolve("../tmdb-docs/contents/docs/api-reference");
    mkdirSync(targetDocsDir, { recursive: true });

    let generatedCount = 0;

    console.log("📖 Generating API reference documentation...\n");

    for (const [apiClassName, mdxName] of Object.entries(ENDPOINT_MAPPING)) {
      // Build the correct source file path
      let sourceFile: string;

      // Handle special cases
      if (apiClassName === "ImageAPI") {
        sourceFile = resolve("src/images/images.ts");
      } else if (apiClassName === "TVSeriesListsAPI") {
        sourceFile = resolve("src/endpoints/tv_series_lists.ts");
      } else if (apiClassName === "TVSeriesAPI") {
        sourceFile = resolve("src/endpoints/tv_series.ts");
      } else {
        const filename = mdxName.replace(/-/g, "_");
        sourceFile = resolve("src/endpoints", `${filename}.ts`);
      }

      console.log(`✨ Generating ${apiClassName}...`);

      const mdx = generateApiDocumentation(apiClassName, sourceFile);
      if (mdx) {
        const outputPath = resolve(targetDocsDir, `${mdxName}.mdx`);
        writeFileSync(outputPath, mdx);
        console.log(`✓ Written to ${outputPath}`);
        generatedCount++;
      } else {
        console.log(`⚠️  Could not find class ${apiClassName} in ${sourceFile}`);
      }
    }

    console.log(`\n✅ Generated ${generatedCount} API reference files`);
  } catch (error) {
    console.error("❌ Documentation generation failed:", error);
    process.exit(1);
  }
}

main();


