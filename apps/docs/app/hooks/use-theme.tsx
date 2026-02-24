"use client";

import { useEffect, useState } from "react";

export function useTheme(): "light" | "dark" {
	const [theme, setTheme] = useState<"light" | "dark">(() => {
		if (typeof window === "undefined") return "dark";
		return document.documentElement.classList.contains("dark") ? "dark" : "light";
	});

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	return theme;
}
