import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { TMDBProvider } from "@/components/tmdb";

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<TMDBProvider apiKey={process.env.NEXT_PUBLIC_TMDB_KEY || ""}>
			<HomeLayout {...baseOptions()}>{children}</HomeLayout>;
		</TMDBProvider>
	);
}
