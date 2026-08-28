export type GameMode = "regular" | "pve";

export type CatalogItem = {
  id: string;
  name: string;
  shortName: string;
  lastLowPrice: number | null;
  avg24hPrice: number | null;
  low24hPrice: number | null;
  high24hPrice: number | null;
  changeLast48hPercent: number | null;
  lastOfferCount: number | null;
  lastScan: string | null;
  width: number;
  height: number;
  weight: number;
  basePrice: number;
  types: string[];
  noFlea: boolean;
  bestTraderRub: number | null;
  bestTraderName: string | null;
};

export type PricePoint = {
  priceMin: number;
  price: number;
  offerCount: number | null;
  timestamp: number;
};

export type CheapOffer = {
  rank: number;
  price: number;
  timestamp: number;
  offerCount: number | null;
  live: boolean;
};

export type ItemDetail = CatalogItem & {
  cheapest: CheapOffer[];
  history: PricePoint[];
};

export type CatalogResponse = {
  items: CatalogItem[];
  fetchedAt: string;
  mode: GameMode;
};
