import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { source, getLLMText } from "@/lib/source";
import { z } from "zod";

export const runtime = "nodejs";

function createServer() {
	const server = new McpServer({
		name: "@lorenzopant/tmdb docs",
		version: "1.0.0",
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const s = server as any;

	s.registerTool(
		"search_docs",
		{
			description:
				"Search the @lorenzopant/tmdb documentation. Returns relevant pages with titles, URLs, and descriptions.",
			inputSchema: { query: z.string() },
		},
		async ({ query }: { query: string }) => {
			const q = query.toLowerCase();
			const results = source
				.getPages()
				.filter(
					(page) =>
						page.data.title.toLowerCase().includes(q) ||
						(page.data.description?.toLowerCase().includes(q) ?? false),
				)
				.slice(0, 10)
				.map((page) => ({
					title: page.data.title,
					url: page.url,
					description: page.data.description ?? "",
				}));

			return {
				content: [
					{
						type: "text",
						text:
							results.length > 0
								? results.map((r) => `**${r.title}** (${r.url})\n${r.description}`).join("\n\n")
								: "No results found.",
					},
				],
			};
		},
	);

	s.registerTool(
		"read_page",
		{
			description: "Read the full markdown content of a documentation page by its path slug.",
			inputSchema: { path: z.string() },
		},
		async ({ path }: { path: string }) => {
			const slug = path.split("/").filter(Boolean);
			const page = source.getPage(slug);

			if (!page) {
				return {
					content: [{ type: "text", text: `Page not found: ${path}` }],
					isError: true,
				};
			}

			const text = await getLLMText(page);
			return { content: [{ type: "text", text }] };
		},
	);

	return server;
}

async function handleRequest(request: Request): Promise<Response> {
	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined, // stateless
		enableJsonResponse: true,
	});

	const server = createServer();
	await server.connect(transport);
	const response = await transport.handleRequest(request);
	await server.close();
	return response;
}

export async function GET(request: Request): Promise<Response> {
	return handleRequest(request);
}

export async function POST(request: Request): Promise<Response> {
	return handleRequest(request);
}

export async function DELETE(request: Request): Promise<Response> {
	return handleRequest(request);
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version",
		},
	});
}
