import { createFileRoute } from "@tanstack/react-router";
import { FleaApp } from "@/components/flea/flea-app";
import type { GameMode } from "@/lib/tarkov/types";

type FleaSearch = {
  q?: string;
  item?: string;
  mode?: GameMode;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): FleaSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    item: typeof search.item === "string" ? search.item : undefined,
    mode: search.mode === "pve" || search.mode === "regular" ? search.mode : undefined,
  }),
  component: Home,
});

function Home() {
  const search = Route.useSearch();
  return (
    <main>
      <FleaApp search={search} />
    </main>
  );
}
