import type { CatalogItem, CheapOffer, GameMode, ItemDetail, PricePoint } from "./types";
import { nameFromWiki, titleFromNormalized } from "./format";
import { traderName } from "./traders";

const JSON_API = "https://json.tarkov.dev";
const NAMES_URL =
  "https://raw.githubusercontent.com/TarkovTracker/tarkovdata/master/items.en.json";

const CATALOG_TTL_MS = 2 * 60 * 1000;
const NAMES_TTL_MS = 12 * 60 * 60 * 1000;

type RawItem = {
  id: string;
  name?: string;
  shortName?: string;
  normalizedName?: string;
  wikiLink?: string;
  lastLowPrice?: number | null;
  avg24hPrice?: number | null;
  low24hPrice?: number | null;
  high24hPrice?: number | null;
  changeLast48hPercent?: number | null;
  lastOfferCount?: number | null;
  lastScan?: string | null;
  width?: number;
  height?: number;
  weight?: number;
  basePrice?: number;
  types?: string[];
  sellToTrader?: Array<{
    trader: string;
    priceRUB?: number;
    price?: number;
  }>;
};

type NameEntry = { id?: string; name?: string; shortName?: string };

type CacheEntry<T> = { value: T; expires: number };

const catalogCache = new Map<GameMode, CacheEntry<CatalogItem[]>>();
let namesCache: CacheEntry<Map<string, NameEntry>> | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Tarkov data failed (${res.status})`);
  }
  return (await res.json()) as T;
}

async function loadNames(): Promise<Map<string, NameEntry>> {
  const now = Date.now();
  if (namesCache && namesCache.expires > now) return namesCache.value;
  try {
    const raw = await fetchJson<Record<string, NameEntry>>(NAMES_URL);
    const map = new Map<string, NameEntry>();
    for (const [id, entry] of Object.entries(raw)) {
      map.set(id, entry);
    }
    namesCache = { value: map, expires: now + NAMES_TTL_MS };
    return map;
  } catch {
    return namesCache?.value ?? new Map();
  }
}

function resolveName(raw: RawItem, names: Map<string, NameEntry>): { name: string; shortName: string } {
  const named = names.get(raw.id);
  const wiki = nameFromWiki(raw.wikiLink);
  const fromNorm = raw.normalizedName ? titleFromNormalized(raw.normalizedName) : null;
  const placeholder = !raw.name || raw.name.endsWith(" Name") || raw.name === raw.id;
  const name = (named?.name || (!placeholder ? raw.name : null) || wiki || fromNorm || raw.id).trim();
  const shortPlaceholder =
    !raw.shortName || raw.shortName.endsWith(" ShortName") || raw.shortName === raw.id;
  const shortName = (named?.shortName || (!shortPlaceholder ? raw.shortName : null) || name).trim();
  return { name, shortName };
}

function slimItem(raw: RawItem, names: Map<string, NameEntry>): CatalogItem {
  const { name, shortName } = resolveName(raw, names);
  const types = Array.isArray(raw.types) ? raw.types : [];
  let bestTraderRub: number | null = null;
  let bestTraderName: string | null = null;
  for (const offer of raw.sellToTrader ?? []) {
    const rub = offer.priceRUB ?? offer.price ?? 0;
    if (rub > (bestTraderRub ?? 0)) {
      bestTraderRub = rub;
      bestTraderName = traderName(offer.trader);
    }
  }
  return {
    id: raw.id,
    name,
    shortName,
    lastLowPrice: raw.lastLowPrice ?? null,
    avg24hPrice: raw.avg24hPrice ?? null,
    low24hPrice: raw.low24hPrice ?? null,
    high24hPrice: raw.high24hPrice ?? null,
    changeLast48hPercent: raw.changeLast48hPercent ?? null,
    lastOfferCount: raw.lastOfferCount ?? null,
    lastScan: raw.lastScan ?? null,
    width: raw.width || 1,
    height: raw.height || 1,
    weight: raw.weight || 0,
    basePrice: raw.basePrice || 0,
    types,
    noFlea: types.includes("noFlea"),
    bestTraderRub,
    bestTraderName,
  };
}

export async function loadCatalog(mode: GameMode): Promise<CatalogItem[]> {
  const now = Date.now();
  const hit = catalogCache.get(mode);
  if (hit && hit.expires > now) return hit.value;

  const [payload, names] = await Promise.all([
    fetchJson<{ data: { items: Record<string, RawItem> } }>(`${JSON_API}/${mode}/items`),
    loadNames(),
  ]);

  const items = Object.values(payload.data.items).map((raw) => slimItem(raw, names));
  catalogCache.set(mode, { value: items, expires: now + CATALOG_TTL_MS });
  return items;
}

function cheapestFromHistory(
  history: PricePoint[],
  livePrice: number | null,
  liveScan: string | null,
  liveOffers: number | null,
): CheapOffer[] {
  const cutoff = Date.now() - 36 * 60 * 60 * 1000;
  const recent = history.filter((h) => h.timestamp >= cutoff && h.priceMin > 0);
  const pool = recent.length ? recent : history.filter((h) => h.priceMin > 0).slice(-24);

  const byPrice = new Map<number, PricePoint>();
  for (const point of pool) {
    const existing = byPrice.get(point.priceMin);
    if (!existing || point.timestamp > existing.timestamp) {
      byPrice.set(point.priceMin, point);
    }
  }

  const ranked = [...byPrice.values()].sort((a, b) => a.priceMin - b.priceMin).slice(0, 5);

  const liveTs = liveScan ? Date.parse(liveScan) : Date.now();
  if (livePrice && livePrice > 0) {
    const already = ranked.some((p) => p.priceMin === livePrice);
    if (!already) {
      ranked.unshift({
        priceMin: livePrice,
        price: livePrice,
        offerCount: liveOffers,
        timestamp: Number.isFinite(liveTs) ? liveTs : Date.now(),
      });
      ranked.sort((a, b) => a.priceMin - b.priceMin);
      ranked.splice(5);
    }
  }

  return ranked.slice(0, 5).map((point, index) => ({
    rank: index + 1,
    price: point.priceMin,
    timestamp: point.timestamp,
    offerCount: point.offerCount,
    live: livePrice != null && point.priceMin === livePrice,
  }));
}

export async function loadItemDetail(mode: GameMode, id: string): Promise<ItemDetail | null> {
  const catalog = await loadCatalog(mode);
  const item = catalog.find((row) => row.id === id);
  if (!item) return null;

  let history: PricePoint[] = [];
  try {
    const payload = await fetchJson<{ data: PricePoint[] }>(`${JSON_API}/${mode}/prices/${id}`);
    const raw = Array.isArray(payload.data) ? payload.data : [];
    history = raw.map((point) => ({
      priceMin: point.priceMin,
      price: point.price,
      offerCount: point.offerCount ?? null,
      timestamp: point.timestamp,
    }));
  } catch {
    history = [];
  }

  const windowStart = Date.now() - 48 * 60 * 60 * 1000;
  const spark = history.filter((h) => h.timestamp >= windowStart);
  const cheapest = cheapestFromHistory(
    history,
    item.lastLowPrice,
    item.lastScan,
    item.lastOfferCount,
  );

  return {
    ...item,
    cheapest,
    history: spark.length ? spark : history.slice(-24),
  };
}
