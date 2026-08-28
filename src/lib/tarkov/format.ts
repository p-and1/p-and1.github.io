const RUB = new Intl.NumberFormat("ru-RU");

export function formatRub(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${RUB.format(Math.round(value))} ₽`;
}

export function formatRubCompact(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M ₽`;
  if (abs >= 10_000) return `${Math.round(value / 1000)}k ₽`;
  if (abs >= 1000) return `${(value / 1000).toFixed(1)}k ₽`;
  return `${RUB.format(Math.round(value))} ₽`;
}

export function slotsOf(width: number, height: number): number {
  return Math.max(1, (width || 1) * (height || 1));
}

export function pricePerSlot(price: number | null, width: number, height: number): number | null {
  if (price == null) return null;
  return Math.round(price / slotsOf(width, height));
}

export function formatKg(weight: number): string {
  if (!Number.isFinite(weight)) return "—";
  return `${weight.toFixed(weight >= 10 ? 1 : 2)} kg`;
}

export function formatAgo(isoOrMs: string | number | null): string {
  if (isoOrMs == null) return "unknown";
  const ms = typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs);
  if (!Number.isFinite(ms)) return "unknown";
  const delta = Date.now() - ms;
  if (delta < 45_000) return "just now";
  const mins = Math.round(delta / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 36) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function iconUrl(id: string): string {
  return `https://assets.tarkov.dev/${id}-icon.webp`;
}

export function gridImageUrl(id: string): string {
  return `https://assets.tarkov.dev/${id}-grid-image.webp`;
}

export function percentLabel(value: number | null): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

export function titleFromNormalized(normalized: string): string {
  return normalized
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (/^\d/.test(part) || part.length <= 2) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

export function nameFromWiki(wikiLink: string | null | undefined): string | null {
  if (!wikiLink) return null;
  const marker = "/wiki/";
  const idx = wikiLink.indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(wikiLink.slice(idx + marker.length).replace(/_/g, " "));
  } catch {
    return wikiLink.slice(idx + marker.length).replace(/_/g, " ");
  }
}
