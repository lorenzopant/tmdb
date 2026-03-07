import { BackgroundPosters } from "@/components/background";
import { Star } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
	return (
		<div className="relative flex flex-1 flex-col overflow-hidden bg-white dark:bg-black">
			<BackgroundPosters>
				<div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
					<div className="flex max-w-2xl flex-col items-center gap-4">
						<span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-black/60 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white/60">
							TypeScript · TMDB API
						</span>

						<h1 className="text-5xl font-bold tracking-tight text-black dark:text-white">
							The TMDB API, typed from the ground up.
						</h1>

						<p className="max-w-xl text-lg text-black/60 dark:text-white/60">
							A lightweight, fully-typed TypeScript wrapper for the TMDB API. Autocomplete every endpoint, parameter, and
							response — no guessing, no <code className="text-black/80 dark:text-white/80">any</code>.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<Link
							href="/docs"
							className="rounded-lg bg-black dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-colors"
						>
							Get Started
						</Link>
						<Link
							href="https://github.com/lorenzopant/tmdb"
							rel="opener"
							target="__blank"
							className="rounded-lg border flex items-center gap-2 border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-5 py-2.5 text-sm font-semibold text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors backdrop-blur-sm"
						>
							<Star className="size-4.5" />
							Star on GitHub
						</Link>
					</div>

					<pre className="pointer-events-auto rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 px-5 py-3 text-left text-sm text-black/70 dark:text-white/70 backdrop-blur-sm">
						<code>npm install @lorenzopant/tmdb</code>
					</pre>
				</div>
			</BackgroundPosters>
		</div>
	);
}
