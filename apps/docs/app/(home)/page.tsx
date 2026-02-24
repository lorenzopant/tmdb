import { BackgroundPosters } from "@/components/background";
import Link from "next/link";

export default function HomePage() {
	return (
		<div className="relative flex flex-col flex-1">
			<BackgroundPosters>
				<div className="flex flex-col items-center gap-4 max-w-2xl">
					<span className="rounded-full border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5 px-3 py-1 text-xs text-black/60 dark:text-white/60 backdrop-blur-sm">
						TypeScript · TMDB API
					</span>

					<h1 className="text-5xl font-bold tracking-tight text-black dark:text-white">
						The TMDB API, typed from the ground up.
					</h1>

					<p className="text-lg text-black/60 dark:text-white/60 max-w-xl">
						A lightweight, fully-typed TypeScript wrapper for the TMDB API. Autocomplete every endpoint, parameter, and response
						— no guessing, no <code className="text-black/80 dark:text-white/80">any</code>.
					</p>
				</div>

				<div className="pointer-events-auto flex items-center gap-3">
					<Link
						href="/docs"
						className="rounded-lg bg-black dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors"
					>
						Get Started
					</Link>
					<Link
						href="/docs/api-reference"
						className="rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-5 py-2.5 text-sm font-semibold text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors backdrop-blur-sm"
					>
						API Reference
					</Link>
				</div>

				<pre className="pointer-events-auto rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 px-5 py-3 text-left text-sm text-black/70 dark:text-white/70 backdrop-blur-sm">
					<code>npm install @lorenzopant/tmdb</code>
				</pre>
			</BackgroundPosters>
		</div>
	);
}
