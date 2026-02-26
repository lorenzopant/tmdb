"use client";

import { Copy } from "lucide-react";

export default function InstallTmdbCommand() {
	const command = "npm install @lorenzopant/tmdb";

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(command); // copies the text [web:10][web:8]
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 px-5 py-3 text-left text-sm text-black/70 dark:text-white/70 backdrop-blur-sm">
			<code className="flex-1 overflow-x-auto">{command}</code>
			<button
				type="button"
				onClick={copyToClipboard}
				className="shrink-0 rounded-md border border-black/10 dark:border-white/20 bg-black/10 dark:bg-white/10 px-3 py-1 text-xs font-medium"
			>
				<Copy />
			</button>
		</div>
	);
}
