"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Clock,
  Copy,
  Pin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { getCatalog, getItemDetail } from "@/lib/tarkov/functions";
import { useFleaStore } from "@/lib/tarkov/store";
import { searchItems, TYPE_CHIPS, type SortKey } from "@/lib/tarkov/search";
import {
  formatAgo,
  formatKg,
  formatRub,
  formatRubCompact,
  percentLabel,
  pricePerSlot,
  slotsOf,
} from "@/lib/tarkov/format";
import { fleaFee, netFlea } from "@/lib/tarkov/fee";
import { lootVerdict } from "@/lib/tarkov/verdict";
import type { CatalogItem, GameMode, ItemDetail } from "@/lib/tarkov/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemIcon } from "./item-icon";
import { Sparkline } from "./sparkline";

type SearchState = {
  q?: string;
  item?: string;
  mode?: GameMode;
};

export function FleaApp({ search }: { search: SearchState }) {
  const navigate = useNavigate({ from: "/" });
  const storeMode = useFleaStore((s) => s.mode);
  const setMode = useFleaStore((s) => s.setMode);
  const pins = useFleaStore((s) => s.pins);
  const recents = useFleaStore((s) => s.recents);
  const togglePin = useFleaStore((s) => s.togglePin);
  const pushRecent = useFleaStore((s) => s.pushRecent);

  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState(search.q ?? "");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const mode: GameMode = search.mode ?? (hydrated ? storeMode : "regular");
  const selectedId = search.item;

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (search.q != null) setQuery(search.q);
  }, [search.q]);

  const catalogQuery = useQuery({
    queryKey: ["catalog", mode],
    queryFn: () => getCatalog({ data: { mode } }),
    refetchInterval: 120_000,
  });

  const items = catalogQuery.data?.items ?? [];
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const results = useMemo(
    () => searchItems(items, query, sort, typeFilter === "all" ? null : typeFilter),
    [items, query, sort, typeFilter],
  );

  const detailQuery = useQuery({
    queryKey: ["item", mode, selectedId],
    queryFn: () => getItemDetail({ data: { mode, id: selectedId! } }),
    enabled: Boolean(selectedId),
    refetchInterval: 60_000,
  });

  const selected: CatalogItem | ItemDetail | null = selectedId
    ? (detailQuery.data ?? byId.get(selectedId) ?? null)
    : null;

  function setSearch(next: SearchState) {
    void navigate({
      search: {
        q: next.q || undefined,
        item: next.item || undefined,
        mode: next.mode && next.mode !== "regular" ? next.mode : undefined,
      },
    });
  }

  function selectItem(id: string) {
    pushRecent(id);
    setSearch({ q: query, item: id, mode });
  }

  function switchMode(next: GameMode) {
    setMode(next);
    setSearch({ q: query, item: selectedId, mode: next });
  }

  async function copyPrice(value: number | null) {
    if (value == null) return;
    try {
      await navigator.clipboard.writeText(String(Math.round(value)));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  }

  const pinItems = pins.map((id) => byId.get(id)).filter(Boolean) as CatalogItem[];
  const recentItems = recents.map((id) => byId.get(id)).filter(Boolean) as CatalogItem[];
  const showResults = query.trim().length > 0 || typeFilter !== "all";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-16 pt-4 sm:px-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Raid tool
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl">
            Flea Scan
          </h1>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Live cheapest flea prices. Search while you loot.
          </p>
        </div>
        <ModeToggle mode={mode} onChange={switchMode} />
      </header>

      <div className="sticky top-0 z-20 -mx-4 mt-5 bg-bg/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-subtle" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              setSearch({ q: value, item: selectedId, mode });
            }}
            placeholder="GPU, LEDX, factory key…"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            className="h-14 pl-11 pr-12 text-lg"
            aria-label="Search Tarkov items"
          />
          {query ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-sm text-muted hover:text-fg"
              onClick={() => {
                setQuery("");
                setSearch({ q: "", item: selectedId, mode });
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </label>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {TYPE_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setTypeFilter(chip.id)}
              className={cn(
                "h-9 shrink-0 rounded-full px-3.5 text-sm font-medium transition-colors duration-[var(--motion-quick)]",
                typeFilter === chip.id
                  ? "bg-primary text-primary-fg"
                  : "bg-raised text-muted hover:text-fg",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {catalogQuery.isError ? (
        <div className="mt-6 rounded-lg bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="font-medium">Could not reach flea data.</p>
          <p className="mt-1 text-sm text-muted">Check the connection and retry.</p>
          <Button className="mt-4" onClick={() => void catalogQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {catalogQuery.isLoading ? <LoadingState /> : null}

      {selectedId ? (
        <ItemPanel
          item={selected}
          loading={detailQuery.isLoading && !selected}
          refreshing={detailQuery.isFetching}
          pinned={pins.includes(selectedId)}
          copied={copied}
          onCopy={() => void copyPrice(selected?.lastLowPrice ?? null)}
          onPin={() => togglePin(selectedId)}
          onClose={() => setSearch({ q: query, item: undefined, mode })}
          onRefresh={() => void detailQuery.refetch()}
        />
      ) : null}

      {showResults ? (
        <section className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
              {results.length} matches
            </h2>
            <SortToggle sort={sort} onChange={setSort} />
          </div>
          {results.length === 0 && !catalogQuery.isLoading ? (
            <p className="rounded-lg bg-surface px-4 py-8 text-center text-sm text-muted">
              No items match that search.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {results.map((item) => (
                <li key={item.id}>
                  <ItemRow
                    item={item}
                    active={item.id === selectedId}
                    onSelect={() => selectItem(item.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        !catalogQuery.isLoading && (
          <div className="mt-4 flex flex-col gap-6">
            <ItemRail
              title="Raid pins"
              items={pinItems}
              selectedId={selectedId}
              onSelect={selectItem}
              empty="Pin high-value loot for one-tap checks in raid."
            />
            {recentItems.length > 0 ? (
              <ItemRail
                title="Recent"
                items={recentItems}
                selectedId={selectedId}
                onSelect={selectItem}
              />
            ) : null}
            <HotLoot items={items} selectedId={selectedId} onSelect={selectItem} />
          </div>
        )
      )}

      <p className="mt-10 text-center text-xs text-subtle">
        Prices from tarkov.dev flea scans. Not individual listing IDs — the five
        cheapest observed lows from the latest market snapshots.
      </p>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: GameMode; onChange: (m: GameMode) => void }) {
  return (
    <div className="flex rounded-md bg-raised p-1">
      {([
        ["regular", "PVP"],
        ["pve", "PVE"],
      ] as const).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "h-9 min-w-12 rounded-sm px-3 text-sm font-semibold tracking-wide",
            mode === id ? "bg-primary text-primary-fg" : "text-muted",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SortToggle({ sort, onChange }: { sort: SortKey; onChange: (s: SortKey) => void }) {
  const options: { id: SortKey; label: string }[] = [
    { id: "relevance", label: "Match" },
    { id: "cheapest", label: "Cheap" },
    { id: "perSlot", label: "Slot" },
  ];
  return (
    <div className="flex items-center gap-1 text-xs text-muted">
      <SlidersHorizontal className="size-3.5" />
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "h-8 rounded-sm px-2 font-medium",
            sort === opt.id ? "text-fg" : "text-subtle",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ItemRow({
  item,
  active,
  onSelect,
}: {
  item: CatalogItem;
  active?: boolean;
  onSelect: () => void;
}) {
  const pps = pricePerSlot(item.lastLowPrice, item.width, item.height);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg bg-surface px-3 py-2.5 text-left shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-[var(--motion-quick)] ease-[var(--ease-smooth-out)]",
        "hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]",
        active && "shadow-[var(--shadow-border-hover)]",
      )}
    >
      <ItemIcon id={item.id} name={item.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-medium text-fg">{item.shortName}</p>
          <p className="font-mono text-sm tabular-nums text-fg">
            {formatRubCompact(item.lastLowPrice)}
          </p>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted">
          <p className="truncate">{item.name}</p>
          <p className="shrink-0 tabular-nums">
            {pps != null ? `${formatRubCompact(pps)}/slot` : `${item.width}×${item.height}`}
          </p>
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-subtle" />
    </button>
  );
}

function ItemRail({
  title,
  items,
  selectedId,
  onSelect,
  empty,
}: {
  title: string;
  items: CatalogItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  empty?: string;
}) {
  return (
    <section>
      <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex w-28 shrink-0 flex-col items-start gap-2 rounded-lg bg-surface p-2.5 text-left shadow-[var(--shadow-border)]",
                selectedId === item.id && "shadow-[var(--shadow-border-hover)]",
              )}
            >
              <ItemIcon id={item.id} name={item.name} size="sm" />
              <span className="w-full truncate text-sm font-medium">{item.shortName}</span>
              <span className="font-mono text-xs tabular-nums text-muted">
                {formatRubCompact(item.lastLowPrice)}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function HotLoot({
  items,
  selectedId,
  onSelect,
}: {
  items: CatalogItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const hot = useMemo(() => {
    return items
      .filter((item) => {
        if (item.noFlea || !item.lastLowPrice || item.lastLowPrice < 20000) return false;
        if (item.types.includes("poster") || item.types.includes("preset")) return false;
        const slots = item.width * item.height;
        if (slots > 4) return false;
        return item.types.includes("barter") || item.types.includes("keys");
      })
      .sort((a, b) => {
        const ap = pricePerSlot(a.lastLowPrice, a.width, a.height) ?? 0;
        const bp = pricePerSlot(b.lastLowPrice, b.width, b.height) ?? 0;
        return bp - ap;
      })
      .slice(0, 8);
  }, [items]);

  return (
    <section>
      <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
        Dense loot
      </h2>
      <ul className="flex flex-col gap-2">
        {hot.map((item) => (
          <li key={item.id}>
            <ItemRow item={item} active={item.id === selectedId} onSelect={() => onSelect(item.id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ItemPanel({
  item,
  loading,
  refreshing,
  pinned,
  copied,
  onCopy,
  onPin,
  onClose,
  onRefresh,
}: {
  item: CatalogItem | ItemDetail | null;
  loading: boolean;
  refreshing: boolean;
  pinned: boolean;
  copied: boolean;
  onCopy: () => void;
  onPin: () => void;
  onClose: () => void;
  onRefresh: () => void;
}) {
  if (loading || !item) {
    return (
      <div className="mt-2 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
        <Skeleton className="h-16 w-16" />
        <Skeleton className="mt-4 h-10 w-48" />
        <Skeleton className="mt-3 h-24 w-full" />
      </div>
    );
  }

  const detail = "cheapest" in item ? item : null;
  const cheapest = detail?.cheapest ?? [];
  const pps = pricePerSlot(item.lastLowPrice, item.width, item.height);
  const fee = item.lastLowPrice ? fleaFee(item.basePrice, item.lastLowPrice) : 0;
  const net = item.lastLowPrice ? netFlea(item.basePrice, item.lastLowPrice) : null;
  const verdict = lootVerdict(item);
  const change = percentLabel(item.changeLast48hPercent);
  const listAt = item.lastLowPrice != null ? Math.max(1, item.lastLowPrice - 1) : null;

  return (
    <article className="mt-2 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex items-start gap-3">
        <ItemIcon id={item.id} name={item.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
                {item.shortName}
              </h2>
              <p className="truncate text-sm text-muted">{item.name}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh prices">
                <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPin}
                aria-label={pinned ? "Unpin" : "Pin for raid"}
              >
                <Pin className={cn("size-4", pinned && "fill-primary text-primary")} />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close item">
                <X className="size-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge>
              {item.width}×{item.height} · {slotsOf(item.width, item.height)} slot
              {slotsOf(item.width, item.height) === 1 ? "" : "s"}
            </Badge>
            <Badge>{formatKg(item.weight)}</Badge>
            {item.noFlea ? <Badge className="text-drop">No flea</Badge> : null}
            {item.lastOfferCount != null ? <Badge>{item.lastOfferCount} offers</Badge> : null}
            {change ? (
              <Badge
                className={
                  item.changeLast48hPercent != null && item.changeLast48hPercent < 0
                    ? "text-keep"
                    : item.changeLast48hPercent != null && item.changeLast48hPercent > 0
                      ? "text-drop"
                      : "text-muted"
                }
              >
                48h {change}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onCopy}
        className="mt-5 w-full rounded-lg bg-raised px-4 py-4 text-left transition-colors duration-[var(--motion-quick)] hover:bg-bg"
      >
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.14em] text-muted">
          <span>Current cheapest</span>
          <span className="inline-flex items-center gap-1 normal-case tracking-normal">
            {copied ? <Check className="size-3.5 text-keep" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Tap to copy"}
          </span>
        </div>
        <p className="mt-1 font-display text-4xl font-semibold tabular-nums leading-none tracking-tight sm:text-5xl">
          {formatRub(item.lastLowPrice)}
        </p>
        <p className="mt-2 font-mono text-sm tabular-nums text-muted">
          {pps != null ? `${formatRub(pps)} per slot` : "No flea scan"}
          {item.lastScan ? ` · scanned ${formatAgo(item.lastScan)}` : ""}
        </p>
      </button>

      <div
        className={cn(
          "mt-3 rounded-md px-3 py-2 text-sm",
          verdict.call === "extract" && "bg-raised text-keep",
          verdict.call === "take" && "bg-raised text-fg",
          verdict.call === "trader" && "bg-raised text-warn",
          verdict.call === "skip" && "bg-raised text-muted",
        )}
      >
        <p className="font-medium">{verdict.label}</p>
        <p className="text-muted">{verdict.detail}</p>
      </div>

      <section className="mt-5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">
          Top 5 cheapest
        </h3>
        {cheapest.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            {item.noFlea
              ? "This item cannot be listed on the flea."
              : "No recent flea snapshots yet."}
          </p>
        ) : (
          <ol className="mt-2 divide-y divide-border">
            {cheapest.map((offer) => {
              const vsAvg =
                item.avg24hPrice && offer.price
                  ? Math.round(((offer.price - item.avg24hPrice) / item.avg24hPrice) * 100)
                  : null;
              return (
                <li
                  key={`${offer.rank}-${offer.price}-${offer.timestamp}`}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span className="w-6 font-display text-lg font-semibold tabular-nums text-subtle">
                    {offer.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-base font-medium tabular-nums">
                      {formatRub(offer.price)}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-muted">
                      <Clock className="size-3" />
                      {offer.live ? "Live scan" : formatAgo(offer.timestamp)}
                      {offer.offerCount != null ? ` · ${offer.offerCount} offers` : ""}
                    </p>
                  </div>
                  {vsAvg != null ? (
                    <span
                      className={cn("text-xs tabular-nums", vsAvg < 0 ? "text-keep" : "text-muted")}
                    >
                      {vsAvg > 0 ? "+" : ""}
                      {vsAvg}% vs avg
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <Stat label="24h low" value={formatRub(item.low24hPrice)} />
        <Stat label="24h avg" value={formatRub(item.avg24hPrice)} />
        <Stat label="24h high" value={formatRub(item.high24hPrice)} />
        <Stat label="List at" value={listAt != null ? formatRub(listAt) : "—"} />
        <Stat label="Flea fee" value={item.lastLowPrice ? formatRub(fee) : "—"} />
        <Stat label="Net flea" value={formatRub(net)} />
        <Stat
          label={item.bestTraderName ? `Sell ${item.bestTraderName}` : "Best trader"}
          value={formatRub(item.bestTraderRub)}
        />
        <Stat label="Base price" value={formatRub(item.basePrice)} />
      </dl>

      {detail && detail.history.length > 1 ? (
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-muted">
            48h average
          </p>
          <Sparkline points={detail.history} />
        </div>
      ) : null}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-raised px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-mono text-sm tabular-nums">{value}</dd>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <p className="text-sm text-muted">Pulling live flea scans…</p>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
