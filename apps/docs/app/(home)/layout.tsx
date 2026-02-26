import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { TMDBProvider } from "@/components/tmdb";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "@lorenzopant/tmdb",
	description: "The official @lorenzopant/tmdb package documentation.",
};

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<TMDBProvider apiKey={process.env.TMDB_KEY || ""}>
			<HomeLayout {...baseOptions()}>{children}</HomeLayout>;
		</TMDBProvider>
	);
}
