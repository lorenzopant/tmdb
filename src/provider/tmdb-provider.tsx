"use client";

import React, { createContext, useContext, useMemo } from "react";
import { TMDB, TMDBOptions } from "../tmdb";

// Type for the context value
type TmdbContextType = {
	tmdb: TMDB;
};

const TmdbContext = createContext<TmdbContextType | undefined>(undefined);

// Provider for client components, receives apiKey as prop
export function TMDBProvider({ apiKey, options, children }: { apiKey: string; options: TMDBOptions; children: React.ReactNode }) {
	const tmdb = useMemo(() => new TMDB(apiKey, { ...options }), [apiKey, options]);
	return <TmdbContext.Provider value={{ tmdb }}>{children}</TmdbContext.Provider>;
}

// Hook to use the TMDB object
export function useTmdb() {
	const context = useContext(TmdbContext);
	if (!context) {
		throw new Error("useTmdb must be used within a TmdbProvider");
	}
	return context.tmdb;
}
