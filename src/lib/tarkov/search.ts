import type { CatalogItem } from "./types";
import { pricePerSlot } from "./format";

const ALIASES: Record<string, string[]> = {
  gpu: ["graphics card", "graphics"],
  ledx: ["ledx", "transilluminator"],
  btc: ["bitcoin", "physical bitcoin"],
  bitcoin: ["physical bitcoin", "0.2btc"],
  intel: ["intelligence folder", "intelligence"],
  docs: ["documents case", "docs"],
  defib: ["defibrillator"],
  cofdm: ["military cofdm", "wireless signal"],
  virtex: ["virtex"],
  tetriz: ["tetriz"],
  mule: ["m.u.l.e", "mule"],
  sj6: ["sj6"],
  labs: ["terragroup labs access", "labs access"],
  gpuu: ["graphics card"],
  flash: ["military flash drive"],
  ssd: ["ssd drive"],
  rr: ["red rebel"],
  rebel: ["red rebel"],
  moonshine: ["fierce hatchling", "moonshine"],
  lion: ["bronze lion"],
  gpu2: ["graphics card"],
};

export type SortKey = "relevance" | "cheapest" | "perSlot";

function haystack(item: CatalogItem): string {
  return `${item.shortName} ${item.name}`.toLowerCase();
}

function scoreItem(item: CatalogItem, q: string): number {
  if (!q) return 0;
  const short = item.shortName.toLowerCase();
  const name = item.name.toLowerCase();
  if (short === q) return 120;
  if (name === q) return 110;
  if (short.startsWith(q)) return 100;
  if (name.startsWith(q)) return 90;
  if (short.includes(q)) return 80;
  if (name.includes(q)) return 70;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every((t) => haystack(item).includes(t))) {
    return 65;
  }

  const extras = ALIASES[q];
  if (extras?.some((alias) => haystack(item).includes(alias))) return 85;

  return 0;
}

export function searchItems(
  items: CatalogItem[],
  query: string,
  sort: SortKey,
  typeFilter: string | null,
  limit = 40,
): CatalogItem[] {
  const q = query.trim().toLowerCase();
  let pool = items;

  if (typeFilter && typeFilter !== "all") {
    pool = pool.filter((item) => item.types.includes(typeFilter));
  }

  let ranked: CatalogItem[];
  if (!q) {
    ranked = pool.slice();
  } else {
    const aliasNeedles = ALIASES[q] ?? [];
    ranked = pool
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((row) => {
        if (row.score > 0) return true;
        if (aliasNeedles.some((n) => haystack(row.item).includes(n))) return true;
        return false;
      })
      .sort((a, b) => b.score - a.score)
      .map((row) => row.item);
  }

  if (sort === "cheapest") {
    ranked.sort((a, b) => {
      const ap = a.lastLowPrice ?? Number.POSITIVE_INFINITY;
      const bp = b.lastLowPrice ?? Number.POSITIVE_INFINITY;
      return ap - bp;
    });
  } else if (sort === "perSlot") {
    ranked.sort((a, b) => {
      const ap = pricePerSlot(a.lastLowPrice, a.width, a.height) ?? -1;
      const bp = pricePerSlot(b.lastLowPrice, b.width, b.height) ?? -1;
      return bp - ap;
    });
  } else if (!q) {
    ranked.sort((a, b) => {
      const ap = pricePerSlot(a.lastLowPrice, a.width, a.height) ?? -1;
      const bp = pricePerSlot(b.lastLowPrice, b.width, b.height) ?? -1;
      return bp - ap;
    });
  }

  return ranked.slice(0, limit);
}

export const TYPE_CHIPS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "keys", label: "Keys" },
  { id: "barter", label: "Barter" },
  { id: "meds", label: "Meds" },
  { id: "ammo", label: "Ammo" },
  { id: "gun", label: "Guns" },
  { id: "mods", label: "Mods" },
  { id: "provisions", label: "Food" },
];

export const DEFAULT_PIN_IDS = [
  "5c0530ee86f774697952d952", // LEDX
  "57347ca924597744596b4e71", // GPU
  "5c12613b86f7743bbe2c3f76", // Intelligence
  "5c052e6986f7746b207bc3c9", // Defib
  "5c05308086f7746b2101e90b", // Virtex
  "5c12620d86f7743f8b198b72", // Tetriz
  "59faff1d86f7746c51718c9c", // Bitcoin
  "5c94bbff86f7747ee735c08f", // Labs access
];
