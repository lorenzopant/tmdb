"use client";

import { motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useTmdb } from "@/components/tmdb";

export interface BoxesProps {
	className?: string;
	rows?: number;
	cols?: number;
	posters: string[];
}

/**
 * Fisher-Yates shuffle — returns a new shuffled array
 */
function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

/**
 * Builds a grid where no two adjacent cells (horizontal or vertical) share the same poster.
 * Falls back to a random pick when the pool is too small to guarantee uniqueness.
 */
function buildGrid(rows: number, cols: number, posters: string[]): string[][] {
	const grid: string[][] = [];

	for (let r = 0; r < rows; r++) {
		const row: string[] = [];
		for (let c = 0; c < cols; c++) {
			const forbidden = new Set<string>();
			if (c > 0) forbidden.add(row[c - 1]);
			if (r > 0) forbidden.add(grid[r - 1][c]);

			const candidates = posters.filter((p) => !forbidden.has(p));
			const pool = candidates.length > 0 ? candidates : posters;
			row.push(pool[Math.floor(Math.random() * pool.length)]);
		}
		grid.push(row);
	}

	return grid;
}

const PosterCell = React.memo(({ src, showPlus }: { src: string; showPlus: boolean }) => (
	<motion.div
		className="relative w-45 h-64 border-r border-t border-slate-700/40 overflow-hidden"
		initial={{ opacity: 0.25 }}
		whileHover={{ opacity: 0.9, transition: { duration: 0.15 } }}
		transition={{ duration: 0.4 }}
	>
		{src && (
			<img
				src={src}
				alt=""
				role="presentation"
				loading="lazy"
				decoding="async"
				className="h-full w-full object-cover"
				draggable={false}
			/>
		)}
		{showPlus && (
			<svg
				className="pointer-events-none absolute -left-5.5 -top-3.5 h-6 w-10 text-slate-700/60"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				viewBox="0 0 24 24"
			>
				<path d="M12 6v12m6-6H6" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		)}
	</motion.div>
));

PosterCell.displayName = "PosterCell";

const PosterRow = React.memo(({ rowIndex, cols, posters }: { rowIndex: number; cols: number; posters: string[] }) => (
	<div className="relative w-45 h-64 border-l border-slate-700/40">
		{posters.map((src, colIndex) => (
			<PosterCell key={colIndex} src={src} showPlus={rowIndex % 2 === 0 && colIndex % 2 === 0} />
		))}
	</div>
));

PosterRow.displayName = "PosterRow";

export const PosterBoxes = ({ className, rows = 150, cols = 100, posters }: BoxesProps) => {
	const grid = useMemo(() => buildGrid(rows, cols, posters), [rows, cols, posters]);

	return (
		<div
			className={cn("pointer-events-auto absolute inset-0 z-0 flex", className)}
			style={{
				transform: "translate(-50%, -50%) skewX(-48deg) skewY(14deg) scale(0.675)",
				transformOrigin: "center center",
				top: "50%",
				left: "50%",
				width: "300vw",
				height: "300vh",
			}}
		>
			{grid.map((rowPosters, rowIndex) => (
				<PosterRow key={rowIndex} rowIndex={rowIndex} cols={cols} posters={rowPosters} />
			))}
		</div>
	);
};

export function BackgroundPosters({ children }: { children?: React.ReactNode }) {
	const tmdb = useTmdb();
	const [posters, setPosters] = useState<string[]>([]);

	const fetchPosters = useCallback(async () => {
		const [page1, page2] = await Promise.all([tmdb.movie_lists.top_rated(), tmdb.movie_lists.top_rated({ page: 2 })]);

		const urls = [...page1.results, ...page2.results]
			.filter((m) => m.poster_path)
			.map((m) => tmdb.images.poster(m.poster_path, "w185"));

		setPosters(shuffle(urls));
	}, []);

	useEffect(() => {
		fetchPosters();
	}, [fetchPosters]);

	if (!posters.length) return null;

	return (
		<div className="fixed inset-0 overflow-hidden bg-black">
			{/* Grid — z-0, pointer-events-auto */}
			<PosterBoxes posters={posters} />

			{/* Vignette */}
			<div className="pointer-events-none absolute inset-0 z-10 bg-black mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]" />

			{/* Dim */}
			<div className="pointer-events-none absolute inset-0 z-10 bg-black/20" />

			{/* Content slot — pointer-events-none wrapper, children re-enable as needed */}
			{children && (
				<div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-6 text-center">
					{children}
				</div>
			)}
		</div>
	);
}
