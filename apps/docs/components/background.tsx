import { TMDB } from "@lorenzopant/tmdb";
import { cache } from "react";

const COLUMN_COUNT = 9;
const POSTERS_PER_COLUMN = 8;

function shuffle<T>(items: T[]) {
	const list = [...items];
	for (let i = list.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[list[i], list[j]] = [list[j], list[i]];
	}
	return list;
}

const getPosterColumns = cache(async () => {
	const token = process.env.TMDB_KEY;

	if (!token) return [] as string[][];

	try {
		const tmdb = new TMDB(token);
		const [page1, page2] = await Promise.all([tmdb.movie_lists.top_rated(), tmdb.movie_lists.top_rated({ page: 2 })]);

		const posters = shuffle(
			[...page1.results, ...page2.results]
				.filter((movie) => movie.poster_path)
				.map((movie) => tmdb.images.poster(movie.poster_path!, "w342")),
		);

		if (posters.length === 0) return [] as string[][];

		return Array.from({ length: COLUMN_COUNT }, (_, columnIndex) =>
			Array.from({ length: POSTERS_PER_COLUMN }, (_, posterIndex) => {
				const index = (columnIndex * POSTERS_PER_COLUMN + posterIndex) % posters.length;
				return posters[index];
			}),
		);
	} catch {
		return [] as string[][];
	}
});

function PosterColumn({ posters, reverse, duration }: { posters: string[]; reverse?: boolean; duration: number }) {
	const loop = [...posters, ...posters];

	return (
		<div className="relative h-120 w-36 overflow-hidden rounded-[1.75rem] border border-black/10 bg-white/35 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-[6px] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_28px_72px_rgba(0,0,0,0.35)] sm:h-144 sm:w-44 lg:h-160 lg:w-48">
			<div
				className="flex flex-col gap-3 will-change-transform"
				style={{
					animationName: reverse ? "poster-marquee-reverse" : "poster-marquee",
					animationDuration: `${duration}s`,
					animationIterationCount: "infinite",
					animationTimingFunction: "linear",
				}}
			>
				{loop.map((src, index) => (
					<img
						key={`${src}-${index}`}
						src={src}
						alt=""
						role="presentation"
						loading="lazy"
						decoding="async"
						width="342"
						height="513"
						className="aspect-2/3 w-full rounded-[1.25rem] object-cover saturate-[0.95] contrast-[1.02]"
					/>
				))}
			</div>
			<div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30 dark:ring-white/10" />
		</div>
	);
}

export async function BackgroundPosters({ children }: { children?: React.ReactNode }) {
	const columns = await getPosterColumns();
	const hasPosters = columns.some((column) => column.length > 0 && Boolean(column[0]));

	return (
		<div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden">
			<div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-100">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_34%),radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(244,114,182,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.2),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(244,114,182,0.18),transparent_28%)]" />
				<div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-size-[44px_44px] dark:bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
			</div>

			{hasPosters && (
				<div className="pointer-events-none absolute inset-0 overflow-hidden opacity-55 dark:opacity-70">
					<div className="absolute left-1/2 top-1/2 h-[170vh] w-[240vw] -translate-x-1/2 -translate-y-1/2 mask-[radial-gradient(ellipse_at_center,black_38%,transparent_83%)]">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_55%)]" />
					</div>
					<div className="absolute left-1/2 top-1/2 flex w-[220vw] -translate-x-1/2 -translate-y-1/2 justify-center gap-3 sm:gap-5 lg:gap-6">
						{columns.map((column, index) => (
							<div
								key={index}
								className="animate-[poster-column-float_8s_ease-in-out_infinite]"
								style={{
									animationDelay: `${index * 0.8}s`,
								}}
							>
								<PosterColumn
									posters={column}
									reverse={index % 2 === 1}
									duration={index % 2 === 0 ? 34 + index * 1.5 : 30 + index * 1.5}
								/>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.76)_0%,rgba(255,255,255,0.83)_24%,rgba(255,255,255,0.91)_48%,rgba(255,255,255,0.97)_76%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.77)_24%,rgba(0,0,0,0.8)_48%,rgba(0,0,0,0.9)_76%)]" />
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.95),transparent_22%,transparent_78%,rgba(255,255,255,0.95))] dark:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.95),transparent_22%,transparent_78%,rgba(0,0,0,0.95))]" />

			{children && <div className="relative z-10 flex w-full flex-1 flex-col">{children}</div>}
		</div>
	);
}
